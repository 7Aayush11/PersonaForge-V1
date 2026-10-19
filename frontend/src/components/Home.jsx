import React, { useState, useEffect, useCallback, useRef } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Preview from "./Preview";
import Dashboard from "./Dashboard";
import Header from "./Header";
import UpgradeModal from "./UpgradeModal";
import MarketingLanding from "./Landing";
import Footer from "./Footer";
import StaticPage from "./StaticPage";
import PricingPage from "./PricingPage";
import ToastStack from "./Toast";
import AuthModal from "./AuthModal";
import { supabase } from "../supabaseClient";
import Loader from "./Loader";

const api = process.env.REACT_APP_API_URL;

const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
`;

// ─── Styled components ────────────────────────────────────────────────────────

const AppWrap = styled.div`
  min-height: 100vh;
  background: #0b0e14;
  color: #e6eef8;
  font-family: var(--font-body, "Inter", sans-serif);
`;

const LoaderOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(11, 14, 20, 0.94);
  backdrop-filter: blur(8px);
`;

// Page-specific UI lives in PricingPage.jsx and StaticPage.jsx.

// ─── Toast hook ───────────────────────────────────────────────────────────────

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback((message, type = "info", action = null) => {
    const id = ++idRef.current;
    const title =
      type === "success" ? "Success" :
      type === "error" ? "Something went wrong" :
      "Notice";

    setToasts((current) => [
      ...current,
      { id, title, message, type, action, duration: 5000 },
    ]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Home() {
  // ── Auth
  const [user, setUser] = useState(null);

  // ── Entitlements
  const [entitlements, setEntitlements] = useState({
    tier: "guest",
    can_generate: true,
    can_edit: false,
    can_deploy: false,
    weekly_edits_used: 0,
    weekly_edits_limit: 0,
    generations_used: 0,
    generation_limit: 1,
  });

  // ── Portfolio state
  const [files, setFiles] = useState(null);
  const [session_id, setSessionId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [slug, setSlug] = useState("");
  const [deployedUrl, setDeployedUrl] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [assembledHtml, setAssembledHtml] = useState(null);

  // ── UI state
  const [view, setView] = useState(() => {
    const path = window.location.pathname;
    if (path === "/dashboard") return "dashboard";
    if (path === "/preview") return "preview";
    if (path === "/pricing" || path === "/about") return path.slice(1);
    if (["/privacy", "/terms", "/cookies", "/refund-policy"].includes(path)) return path.slice(1);
    return "landing";
  });
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { toasts, addToast, removeToast } = useToasts();

  const token =
    user?.access_token ||
    (typeof localStorage !== "undefined"
      ? localStorage.getItem("sb-access-token")
      : null);

  // ── Routing ────────────────────────────────────────────────────────────────

  const navigate = useCallback((path) => {
    window.history.pushState(null, "", path);
    const [pathname, hash] = path.split("#");
    const route = pathname || "/";
    if (route === "/dashboard") setView("dashboard");
    else if (route === "/pricing") setView("pricing");
    else if (route === "/about") setView("about");
    else if (["/privacy", "/terms", "/cookies", "/refund-policy"].includes(route)) setView(route.slice(1));
    else if (route === "/preview") setView("preview");
    else setView("landing");
    if (hash) window.setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      if (path === "/dashboard") setView("dashboard");
      else if (path === "/pricing") setView("pricing");
      else if (path === "/about") setView("about");
      else if (["/privacy", "/terms", "/cookies", "/refund-policy"].includes(path)) setView(path.slice(1));
      else if (path === "/preview") setView("preview");
      else setView("landing");
    };
    // Resolve the current URL on mount and keep browser back/forward in sync.
    onPop();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // ── Entitlements ───────────────────────────────────────────────────────────

  const fetchEntitlements = useCallback(async () => {
    try {
      const res = await fetch(`${api}/entitlements`, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setEntitlements(data);
      }
    } catch (e) {
      console.error("Failed to fetch entitlements:", e);
    }
  }, [token]);

  // ── Auth init: Supabase owns session persistence ────────────────────────────

  useEffect(() => {
    let mounted = true;

    const applySession = (session) => {
      if (!mounted) return;
      setUser(
        session
          ? { ...session.user, access_token: session.access_token }
          : null
      );
      if (session?.user) setShowAuthModal(false);
    };

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error("Could not restore Supabase session:", error);
          return;
        }
        applySession(data.session);
      })
      .catch((error) => {
        console.error("Could not restore Supabase session:", error);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchEntitlements();
  }, [fetchEntitlements]);

  // ── Sign in / out ──────────────────────────────────────────────────────────

  const handleSignIn = useCallback(() => {
    // Use the existing Supabase-powered AuthModal. The backend does not
    // provide /auth/google; Supabase handles OAuth and the callback itself.
    setShowAuthModal(true);
  }, []);

  const handleSignOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      addToast(error.message || "Could not sign out. Please try again.", "error");
      return;
    }

    // The Supabase auth-state listener clears the user/session token.
    setShowAuthModal(false);
    setFiles(null);
    setAssembledHtml(null)
    setSessionId(null);
    setSlug("");
    setDeployedUrl(null);
    setView("landing");
    navigate("/");
    addToast("Signed out.", "info");
  }, [navigate, addToast]);

  // ── Generate ───────────────────────────────────────────────────────────────

  const handleUpload = useCallback(async (eventOrFile) => {
    const selectedFile = eventOrFile?.target?.files?.[0] || (eventOrFile instanceof File ? eventOrFile : null);
    if (!selectedFile) return;

    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(`${api}/generate`, {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.status === 403) {
        const body = await res.json().catch(() => ({}));
        const code = body?.detail?.code;
        const message = body?.detail?.message;

        if (
          code === "GENERATION_LIMIT_REACHED" ||
          code === "GUEST_GENERATION_LIMIT_REACHED"
        ) {
          addToast(
            message || "Generation limit reached.",
            "error",
            {
              label: "Upgrade",
              action: () => setShowUpgrade(true),
            }
          );
        } else {
          addToast(message || "Access denied.", "error");
        }
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail?.message || body?.detail || "Generation failed.");
      }

      const data = await res.json();
      setFiles(data.files || data);
      setAssembledHtml(data.assembled_html || null);
      setSessionId(data.session_id);
      navigate("/preview");
      setView("preview");
      await fetchEntitlements();
    } catch (err) {
      addToast(err.message || "Something went wrong.", "error");
    } finally {
      setGenerating(false);
    }
  }, [token, navigate, fetchEntitlements, addToast]);

  // ── Edit ───────────────────────────────────────────────────────────────────

  const handleEdit = useCallback(
    async (instruction) => {
      if (!session_id) return;
      setEditing(true);
      try {
        const res = await fetch(`${api}/edit`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ session_id, instruction }),
        });

        if (res.status === 403) {
          const body = await res.json().catch(() => ({}));
          const code = body?.detail?.code;
          const message = body?.detail?.message;

          if (code === "EDIT_LIMIT_REACHED") {
            addToast(
              message || "Edit limit reached for this week.",
              "error",
              {
                label: "Upgrade",
                action: () => setShowUpgrade(true),
              }
            );
          } else {
            addToast(message || "Access denied.", "error");
          }
          return;
        }

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.detail?.message || body?.detail || "Edit failed.");
        }

        const data = await res.json();
        setFiles(data.files || data);
        setAssembledHtml(data.assembled_html || null);
        await fetchEntitlements();
      } catch (err) {
        // Try self-heal
        try {
          const healRes = await fetch(`${api}/self-heal`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ session_id, instruction }),
          });
          if (healRes.ok) {
            const data = await healRes.json();
            setFiles(data.files || data);
            return;
          }
        } catch {}
        addToast(err.message || "Edit failed.", "error");
      } finally {
        setEditing(false);
      }
    },
    [session_id, token, fetchEntitlements, addToast]
  );

  // ── Deploy ─────────────────────────────────────────────────────────────────

  const handleDeploy = useCallback(async () => {
    if (!session_id || !slug) return;
    setDeploying(true);
    try {
      const res = await fetch(`${api}/deploy`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ session_id, slug }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail?.message || body?.detail || "Deploy failed.");
      }

      const data = await res.json();
      setDeployedUrl(data.url || data.deployed_url);
      addToast("Deployed successfully!", "success");
    } catch (err) {
      addToast(err.message || "Deploy failed.", "error");
    } finally {
      setDeploying(false);
    }
  }, [session_id, slug, token, addToast]);

  const handleDeleteDeploy = useCallback(async () => {
    if (!session_id) return;
    setDeploying(true);
    try {
      const res = await fetch(`${api}/p/${slug}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ session_id, slug }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail?.message || body?.detail || "Delete failed.");
      }

      setDeployedUrl(null);
      addToast("Deployment removed.", "info");
    } catch (err) {
      addToast(err.message || "Delete failed.", "error");
    } finally {
      setDeploying(false);
    }
  }, [session_id, slug, token, addToast]);

  // ── Upgrade success ────────────────────────────────────────────────────────

  const handleUpgradeSuccess = useCallback(async () => {
    setShowUpgrade(false);
    await fetchEntitlements();
  }, [fetchEntitlements]);

  // ── Render ─────────────────────────────────────────────────────────────────

  const renderView = () => {
    if (view === "preview" && files) {
      return (
        <Preview
          files={files}
          assembledHtml={assembledHtml}
          user={user}
          slug={slug}
          setSlug={setSlug}
          session_id={session_id}
          setFiles={setFiles}
          deployedUrl={deployedUrl}
          deploying={deploying}
          onDeploy={handleDeploy}
          onDelete={handleDeleteDeploy}
          onEdit={handleEdit}
          isEditing={editing}
          onBack={() => navigate("/")}
          entitlements={entitlements}
          onUpgrade={() => setShowUpgrade(true)}
          addToast={addToast}
        />
      );
    }

    if (view === "dashboard") {
      return (
        <Dashboard
          user={user}
          onOpen={async (p) => {
            const sid = p.session_id || p.id;
            setSessionId(sid);
            setSlug(p.slug || "");
            setDeployedUrl(p.deployed_url || null);
            setGenerating(true);
            try {
              const token = (await supabase.auth.getSession())?.data?.session?.access_token;
              const res = await fetch(`${api}/portfolio/${sid}`, {
                credentials: "include",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              });
              if (!res.ok) throw new Error("Failed to load portfolio");
              const data = await res.json();
              setFiles(data.files);
              setAssembledHtml(data.assembled_html || null);
              navigate("/preview");
              setView("preview");
            } catch (err) {
              console.error("Failed to open portfolio:", err);
            } finally {
              setGenerating(false);
            }
          }}
          onNew={() => navigate("/")}
          entitlements={entitlements}
          onUpgrade={() => setShowUpgrade(true)}
        />
      );
    }

    if (view === "pricing") {
      return <PricingPage
      entitlements={entitlements} onUpgrade={() => setShowUpgrade(true)} addToast={addToast} onRefreshEntitlements={fetchEntitlements} supabase = {supabase} api={api}/>;
    }

    if (view === "about") {
      return <StaticPage type="about" onNavigate={navigate} />;
    }

    if (["privacy", "terms", "cookies", "refund-policy"].includes(view)) {
      return <StaticPage type={view} onNavigate={navigate} />;
    }

    // Default: full marketing landing page (preserves the earlier visual design and all sections).
    if (view === "landing") {
      return <MarketingLanding handleUpload={handleUpload} onNavigate={navigate} />;
    }

    return <MarketingLanding handleUpload={handleUpload} onNavigate={navigate} />;
  };

  return (
    <AppWrap>
      <GlobalStyle />

      {/* Header is shown on all views except preview (preview has its own nav) */}
      {view !== "preview" && (
        <Header
          user={user}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onNavigate={navigate}
          entitlements={entitlements}
          onUpgrade={() => setShowUpgrade(true)}
        />
      )}

      {renderView()}

      {(generating || editing) && (
        <LoaderOverlay role="status" aria-live="polite" aria-label={generating ? "Generating portfolio" : "Applying portfolio edits"}>
          <Loader />
        </LoaderOverlay>
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          addToast={addToast}
        />
      )}

      {view !== "preview" && <Footer onNavigate={navigate}/>}

      {/* Upgrade modal */}
      {showUpgrade && (
        <UpgradeModal
          user={user}
          onClose={() => setShowUpgrade(false)}
          onSuccess={handleUpgradeSuccess}
          onSignIn={handleSignIn}
          addToast={addToast}
        />
      )}

      {/* Shared toast component */}
      <ToastStack toasts={toasts} onDismiss={removeToast} />
    </AppWrap>
  );
}