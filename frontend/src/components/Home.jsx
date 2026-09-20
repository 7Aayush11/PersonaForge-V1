import { useState, useEffect } from "react";
import ToastStack from "./Toast";
import Footer from "./Footer";
import Loader from "./Loader";
import Landing from "./Landing";
import Header from "./Header";
import Preview from "./Preview";
import { supabase } from "../supabaseClient";
import AuthModal from "./AuthModal";
import Dashboard from "./Dashboard";

export default function Home() {
  const [view, setView] = useState("home");
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [session_id, setSession_Id] = useState(null);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [slug, setSlug] = useState("");
  const [deployedUrl, setDeployedUrl] = useState("");
  const [deploying, setDeploying] = useState(false);

  const api = process.env.REACT_APP_API_URL;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setShowAuth(false);
    });

    const pendingSessionId = sessionStorage.getItem("personaforge_session_id");
    if (pendingSessionId && !files) {
      fetch(`${api}/portfolio/${pendingSessionId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.files) {
            setSession_Id(data.session_id);
            setFiles(data.files);
          }
        })
        .catch(() => {});
    }

    return () => listener.subscription.unsubscribe();
  }, []);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, duration: 6000, ...toast }]);
    return id;
  };

  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    addToast({ type: "info", title: "Signed out", message: "See you next time." });
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch(`${api}/generate`, { method: "POST", body: formData });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        addToast({ type: "error", title: "Generation failed", message: err.detail || "Something went wrong reading that file." });
        return;
      }

      const data = await res.json();
      setSession_Id(data.session_id);
      sessionStorage.setItem("personaforge_session_id", data.session_id);
      setFiles(data.files);
    } catch (error) {
      addToast({ type: "error", title: "Generation failed", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (message) => {
    if (!message.trim() || !files) return;

    setEditing(true);
    try {
      const res = await fetch(`${api}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id, instruction: message }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        addToast({ type: "error", title: "Edit failed", message: err.detail || "Couldn't apply that change." });
        return;
      }

      const data = await res.json();
      setFiles({ ...data.updated_files });
    } catch (error) {
      addToast({ type: "error", title: "Edit failed", message: error.message });
    } finally {
      setEditing(false);
    }
  };

  const handleReset = () => {
    setFiles(null);
    setSession_Id(null);
    sessionStorage.removeItem("personaforge_session_id");
  };

  const handleEditPortfolio = async (session_id) => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/portfolio/${session_id}`);
      const data = await res.json();
      if (data?.files) {
        setSession_Id(session_id);
        sessionStorage.setItem("personaforge_session_id", session_id);
        setFiles(data.files);
        setView("editor");
      }
    } catch (err) {
      addToast({ type: "error", title: "Couldn't load portfolio", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header
        showReset={!!files}
        onReset={handleReset}
        user={user}
        onSignIn={() => setShowAuth(true)}
        onSignOut={handleSignOut}
        onDashboard = {()=>setView("dashboard")}
      />

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {loading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Loader />
          </div>
        ) : view === "dashboard" ? (
          <Dashboard
            user={user}
            onNewPortfolio={() => setView("home")}
            onEditPortfolio={handleEditPortfolio}
            addToast={addToast}
          />
        ) : files ? (
          <Preview
            files={files}
            setFiles={setFiles}
            addToast={addToast}
            handleEdit={handleEdit}
            editing={editing}
            user={user}
            onSignIn={() => setShowAuth(true)}
            session_id={session_id}
            slug={slug}
            setSlug={setSlug}
            deployedUrl={deployedUrl}
            setDeployedUrl={setDeployedUrl}
            deploying={deploying}
            setDeploying={setDeploying}
          />
        ) : (
          <Landing handleUpload={handleUpload} />
        )}
      </div>

      {!files && <Footer />}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} addToast={addToast} />}
    </div>
  );
}