import React, { useState, useEffect, useCallback, useRef } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import Preview from "./Preview";
import Dashboard from "./Dashboard";
import Header from "./Header";
import UpgradeModal from "./UpgradeModal";
import MarketingLanding from "./Landing";
import Footer from "./Footer";

const api = process.env.REACT_APP_API_URL;

function resolveView(pathname, hasFiles = false) {
  if (pathname === "/dashboard") return "dashboard";
  if (pathname === "/pricing") return "pricing";
  if (pathname === "/about") return "about";
  if (["/privacy", "/terms", "/cookies"].includes(pathname)) return pathname.slice(1);
  // A preview only exists in memory; refreshing /preview must not hide the app shell.
  if (pathname === "/preview" && hasFiles) return "preview";
  return "landing";
}

// ─── Global toast styles ─────────────────────────────────────────────────────

const slideInToast = keyframes`
  from { opacity: 0; transform: translateY(12px) }
  to   { opacity: 1; transform: translateY(0) }
`;

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

const ToastStack = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
`;

const Toast = styled.div`
  background: #1c2430;
  border: 1px solid
    ${(p) =>
      p.$type === "error"
        ? "rgba(239,68,68,0.35)"
        : p.$type === "success"
        ? "rgba(26,188,156,0.35)"
        : "rgba(255,255,255,0.1)"};
  color: ${(p) =>
    p.$type === "error"
      ? "#EF4444"
      : p.$type === "success"
      ? "#1ABC9C"
      : "#e6eef8"};
  padding: 10px 14px;
  border-radius: 10px;
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 13px;
  max-width: 320px;
  animation: ${slideInToast} 0.2s ease;
  pointer-events: all;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.4;
`;

const ToastAction = styled.button`
  background: none;
  border: none;
  color: #ff6b35;
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  white-space: nowrap;
  text-decoration: underline;
  text-underline-offset: 2px;
  flex-shrink: 0;
  pointer-events: all;
`;

const GenerateBtn = styled.button`
  background: #ff6b35;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 14px 32px;
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: center;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

// ─── Static pages (pricing, about) ───────────────────────────────────────────

const StaticWrap = styled.div`
  max-width: 860px;
  margin: 0 auto;
  padding: 60px 24px 100px;
`;

const StaticTitle = styled.h1`
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 36px;
  font-weight: 800;
  color: #e6eef8;
  margin: 0 0 12px;
`;

const StaticSub = styled.p`
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 16px;
  color: #8b95a7;
  margin: 0 0 48px;
`;

const PlansRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 48px;
`;

const PricingCard = styled.div`
  background: #141a24;
  border: 1.5px solid
    ${(p) => (p.$featured ? "#ff6b35" : "rgba(255,255,255,0.08)")};
  border-radius: 14px;
  padding: 28px 24px;
  position: relative;
`;

const PricingBadge = styled.span`
  position: absolute;
  top: -12px;
  left: 24px;
  background: #ff6b35;
  color: #fff;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 99px;
`;

const PricingTier = styled.p`
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 15px;
  font-weight: 700;
  color: #e6eef8;
  margin: 0 0 6px;
`;

const PricingAmount = styled.p`
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 32px;
  font-weight: 800;
  color: ${(p) => (p.$featured ? "#ff6b35" : "#e6eef8")};
  margin: 0 0 4px;

  span {
    font-size: 14px;
    font-weight: 400;
    color: #8b95a7;
  }
`;

const PricingDesc = styled.p`
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 13px;
  color: #8b95a7;
  margin: 0 0 20px;
`;

const PricingFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const PricingFeature = styled.li`
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 13px;
  color: ${(p) => (p.$off ? "#4a5568" : "#8b95a7")};
  display: flex;
  align-items: center;
  gap: 7px;

  &::before {
    content: "${(p) => (p.$off ? "✕" : "✓")}";
    color: ${(p) => (p.$off ? "#4a5568" : "#1abc9c")};
    font-weight: 700;
    flex-shrink: 0;
  }
`;

const AboutPage = styled.main`width:min(1000px,calc(100% - 48px));margin:0 auto;padding:66px 0 90px;@media(max-width:600px){width:calc(100% - 32px);padding:44px 0 60px;}`;
const AboutHero = styled.section`max-width:760px;margin-bottom:42px;`;
const AboutEyebrow = styled.div`color:#ff8b62;font:11px var(--font-mono, monospace);letter-spacing:.15em;text-transform:uppercase;`;
const AboutTitle = styled.h1`margin:15px 0 0;color:#e6eef8;font-family:var(--font-display, "Space Grotesk", sans-serif);font-size:clamp(38px,6vw,64px);line-height:1.04;letter-spacing:-.055em;`;
const AboutIntro = styled.p`max-width:700px;margin:22px 0 0;color:#a2adbd;font-size:16px;line-height:1.9;`;
const AboutGrid = styled.div`display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;@media(max-width:760px){grid-template-columns:1fr;}`;
const AboutCard = styled.article`padding:25px;border:1px solid rgba(255,255,255,.09);border-radius:16px;background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.012));.icon{color:#ff8b62;}h3{margin:0;color:#e6eef8;font-size:17px;line-height:1.4;}p{margin:12px 0 0;color:#8b95a7;font-size:13px;line-height:1.9;}`;
const AboutIcon = styled.div`display:grid;place-items:center;width:40px;height:40px;margin-bottom:18px;border-radius:11px;border:1px solid rgba(255,107,53,.24);background:rgba(255,107,53,.08);color:#ff8b62;font-size:20px;`;
const ContactCard = styled.section`display:flex;align-items:center;justify-content:space-between;gap:28px;margin-top:24px;padding:30px;border:1px solid rgba(255,107,53,.2);border-radius:16px;background:radial-gradient(ellipse at 0% 100%,rgba(255,107,53,.09),transparent 65%),#11151e;h2{margin:10px 0 0;color:#e6eef8;font-family:var(--font-display, "Space Grotesk", sans-serif);font-size:clamp(22px,3vw,30px);letter-spacing:-.035em;}p{max-width:580px;margin:10px 0 0;color:#8b95a7;font-size:13px;line-height:1.8;}@media(max-width:700px){flex-direction:column;align-items:flex-start;padding:24px;}`;
const ContactButton = styled.a`display:flex;flex-direction:column;gap:7px;flex-shrink:0;padding:13px 16px;border-radius:10px;background:#ff6b35;color:#fff;text-decoration:none;font-size:13px;font-weight:700;span{font-size:11px;font-weight:500;overflow-wrap:anywhere;} &:hover{filter:brightness(1.08);}`;

function StaticPage({ type, onUpgrade }) {
  if (type === "pricing") {
    return (
      <StaticWrap>
        <StaticTitle>Simple pricing</StaticTitle>
        <StaticSub>Start free. Upgrade when you need more.</StaticSub>
        <PlansRow>
          <PricingCard>
            <PricingTier>Free</PricingTier>
            <PricingAmount>₹0<span>/forever</span></PricingAmount>
            <PricingDesc>For trying PersonaForge</PricingDesc>
            <PricingFeatures>
              <PricingFeature>1 portfolio generation</PricingFeature>
              <PricingFeature>3 edits per week (signed-in users)</PricingFeature>
              <PricingFeature>Sign in for editing; deployment is a Premium feature</PricingFeature>
              <PricingFeature $off>Download ZIP</PricingFeature>
              <PricingFeature $off>Unlimited portfolios</PricingFeature>
            </PricingFeatures>
          </PricingCard>
          <PricingCard $featured>
            <PricingBadge>Monthly</PricingBadge>
            <PricingTier>Premium</PricingTier>
            <PricingAmount $featured>₹99<span>/month</span></PricingAmount>
            <PricingDesc>Flexible monthly access</PricingDesc>
            <PricingFeatures>
              <PricingFeature>Premium AI model access</PricingFeature>
              <PricingFeature>Portfolio generation and AI-assisted editing</PricingFeature>
              <PricingFeature>Deployment and analytics tools</PricingFeature>
              <PricingFeature>Faster responses and ZIP download</PricingFeature>
            </PricingFeatures>
          </PricingCard>
          <PricingCard>
            <PricingBadge>Quarterly</PricingBadge>
            <PricingTier>Premium — 3 months</PricingTier>
            <PricingAmount>₹249<span>/3 months</span></PricingAmount>
            <PricingDesc>Pay once every quarter</PricingDesc>
            <PricingFeatures>
              <PricingFeature>Premium AI model access</PricingFeature>
              <PricingFeature>Portfolio generation and AI-assisted editing</PricingFeature>
              <PricingFeature>Deployment and analytics tools</PricingFeature>
              <PricingFeature>Faster responses and ZIP download</PricingFeature>
            </PricingFeatures>
          </PricingCard>
        </PlansRow>
        <GenerateBtn style={{ maxWidth: 280, margin: "0 auto" }} onClick={onUpgrade}>
          Get Premium
        </GenerateBtn>
      </StaticWrap>
    );
  }

  if (type === "about") {
    return (
      <AboutPage>
        <AboutHero>
          <AboutEyebrow>OUR STORY</AboutEyebrow>
          <AboutTitle>Good work deserves to be seen.</AboutTitle>
          <AboutIntro>PersonaForge helps turn the experience already captured in your resume into a personal website you can refine, own, and share with confidence.</AboutIntro>
        </AboutHero>
        <AboutGrid>
          <AboutCard>
            <AboutIcon>✦</AboutIcon>
            <h3>Why we’re building PersonaForge</h3>
            <p>Your skills, projects, and achievements should be easy to discover—not buried in a document or scattered across different platforms. We’re making it easier to create a professional online presence without needing to build a website from scratch.</p>
          </AboutCard>
          <AboutCard>
            <AboutIcon>⌘</AboutIcon>
            <h3>Designed to get you started</h3>
            <p>Start with your resume, generate a first draft with AI, then refine the result using plain-language instructions. You stay in control: review the content, correct anything that needs attention, and publish only when you’re ready.</p>
          </AboutCard>
          <AboutCard>
            <AboutIcon>↗</AboutIcon>
            <h3>Who it’s for</h3>
            <p>Students, job seekers, developers, designers, freelancers, and creators who want a simple way to present their experience and work in one shareable place.</p>
          </AboutCard>
        </AboutGrid>
        <ContactCard>
          <div>
            <AboutEyebrow>GET IN TOUCH</AboutEyebrow>
            <h2>Questions, feedback, or ideas?</h2>
            <p>We’d love to hear from you. Reach out about product feedback, support, partnerships, or anything that could help make PersonaForge better.</p>
          </div>
          <ContactButton href="mailto:nisarayush1172004@gmail.com">✉ Contact us <span>nisarayush1172004@gmail.com</span></ContactButton>
        </ContactCard>
      </AboutPage>
    );
  }

  if (["privacy", "terms", "cookies"].includes(type)) {
    const policyContent = {
      privacy: { title: "Privacy Policy", intro: "Your documents and personal information should be handled thoughtfully.", sections: [["Information you provide", "PersonaForge may process files you upload, account details, and the instructions you provide to generate or edit a portfolio."], ["How information is used", "Information is used to provide portfolio generation, editing, account, deployment, and billing features. Do not upload documents you are not authorized to share."], ["Your responsibility", "Review generated content before publishing and avoid including sensitive information that is not needed in your portfolio."], ["Questions", "For privacy questions, contact nisarayush1172004@gmail.com."]] },
      terms: { title: "Terms of Use", intro: "By using PersonaForge, you agree to use the service responsibly.", sections: [["Your content", "You are responsible for ensuring you have the rights and permission to upload documents, images, and other material."], ["AI-generated content", "AI-generated websites may contain omissions or inaccuracies. Review all details before sharing or relying on generated content."], ["Subscriptions and access", "Paid features are subject to the plan displayed at checkout and the applicable billing terms. Manage subscriptions through the available account or billing options."], ["Contact", "Questions about these terms can be sent to nisarayush1172004@gmail.com."]] },
      cookies: { title: "Cookie Policy", intro: "PersonaForge may use browser storage and cookies to support essential product functionality.", sections: [["Essential functionality", "Session-related storage or cookies may help maintain your session, protect requests, and keep the application working."], ["Your choices", "You can manage cookies through your browser settings. Disabling essential storage may affect sign-in or other product features."], ["Questions", "For questions about this policy, contact nisarayush1172004@gmail.com."]] }
    };
    const policy = policyContent[type];
    return <StaticWrap><StaticTitle>{policy.title}</StaticTitle><StaticSub>{policy.intro}</StaticSub>{policy.sections.map(([heading, body]) => <div key={heading} style={{ marginBottom: 28, maxWidth: 760 }}><h2 style={{ color: "#e6eef8", fontSize: 18, margin: "0 0 8px" }}>{heading}</h2><p style={{ color: "#8b95a7", fontSize: 14, lineHeight: 1.9, margin: 0 }}>{body}</p></div>)}<p style={{ color: "#687487", fontSize: 11, lineHeight: 1.7 }}>These pages provide general product information and should be reviewed for legal completeness before public launch.</p></StaticWrap>;
  }

  return null;
}

// ─── Toast hook ───────────────────────────────────────────────────────────────

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback((message, type = "info", action = null) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, type, action }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
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
  const [editing, setEditing] = useState(false);
  const [slug, setSlug] = useState("");
  const [deployedUrl, setDeployedUrl] = useState(null);
  const [deploying, setDeploying] = useState(false);

  // ── UI state
  const [view, setView] = useState(() => resolveView(window.location.pathname));
  const [showUpgrade, setShowUpgrade] = useState(false);

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
    setView(resolveView(pathname || "/", Boolean(files)));
    if (hash) {
      window.setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [files]);

  useEffect(() => {
    const onPop = () => {
      setView(resolveView(window.location.pathname, Boolean(files)));
      const hash = window.location.hash.slice(1);
      if (hash) {
        window.setTimeout(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [files]);

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

  // ── Auth init ──────────────────────────────────────────────────────────────

  useEffect(() => {
    // Try to restore user from localStorage (Supabase-style)
    try {
      const raw = localStorage.getItem("sb-user");
      if (raw) setUser(JSON.parse(raw));
    } catch (error) {
      console.error("Could not restore saved user session:", error);
    }
  }, []);

  useEffect(() => {
    fetchEntitlements();
  }, [fetchEntitlements]);

  // ── Sign in / out ──────────────────────────────────────────────────────────

  const handleSignIn = useCallback(async () => {
    // Trigger Supabase OAuth or modal — stub delegates to auth provider
    // For now, we open a simple sign-in flow if one exists on the api
    try {
      const res = await fetch(`${api}/auth/google`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch {
      addToast("Sign-in unavailable. Please try again.", "error");
    }
  }, [addToast]);

  const handleSignOut = useCallback(async () => {
    try {
      await fetch(`${api}/auth/signout`, {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {}
    setUser(null);
    try { localStorage.removeItem("sb-user"); } catch {}
    try { localStorage.removeItem("sb-access-token"); } catch {}
    setFiles(null);
    setSessionId(null);
    setDeployedUrl(null);
    setView("landing");
    navigate("/");
    addToast("Signed out.", "info");
  }, [token, navigate, addToast]);

  // ── Generate ───────────────────────────────────────────────────────────────

  const handleUpload = useCallback(async (eventOrFile) => {
    const selectedFile = eventOrFile?.target?.files?.[0] || (eventOrFile instanceof File ? eventOrFile : null);
    if (!selectedFile) return;
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
      setSessionId(data.session_id);
      navigate("/preview");
      setView("preview");
      await fetchEntitlements();
    } catch (err) {
      addToast(err.message || "Something went wrong.", "error");
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
      const res = await fetch(`${api}/deploy`, {
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
          setFiles={setFiles}
          session_id={session_id}
          user={user}
          slug={slug}
          setSlug={setSlug}
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
          onOpen={(p) => {
            setFiles(p.files);
            setSessionId(p.session_id || p.id);
            setSlug(p.slug || "");
            setDeployedUrl(p.deployed_url || null);
            navigate("/preview");
          }}
          onNew={() => navigate("/")}
          entitlements={entitlements}
          onUpgrade={() => setShowUpgrade(true)}
        />
      );
    }

    if (view === "pricing") {
      return (
        <StaticPage type="pricing" onUpgrade={() => setShowUpgrade(true)} />
      );
    }

    if (view === "about") {
      return <StaticPage type="about" />;
    }

    if (["privacy", "terms", "cookies"].includes(view)) {
      return <StaticPage type={view} />;
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

      {view !== "preview" && <Footer onNavigate={navigate} />}

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

      {/* Toast stack */}
      <ToastStack>
        {toasts.map((t) => (
          <Toast key={t.id} $type={t.$type || t.type}>
            <span style={{ flex: 1 }}>{t.message}</span>
            {t.action && (
              <ToastAction
                onClick={() => {
                  t.action.action();
                  removeToast(t.id);
                }}
              >
                {t.action.label}
              </ToastAction>
            )}
          </Toast>
        ))}
      </ToastStack>
    </AppWrap>
  );
}