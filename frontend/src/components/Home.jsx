import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Landing from "./Landing";
import Editor from "./Editor";
import Loader from "./Loader";
import ToastStack from "./Toast";

export default function Home() {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [slug, setSlug] = useState("");
  const [deployedUrl, setDeployedUrl] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [manageSlug, setManageSlug] = useState("");
  const [manageToken, setManageToken] = useState("");
  const [deletingSite, setDeletingSite] = useState(false);
  const [toasts, setToasts] = useState([]);

  const api = process.env.REACT_APP_API_URL;

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, duration: 6000, ...toast }]);
    return id;
  };

  const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

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
      setHtml(data.html);
    } catch (error) {
      addToast({ type: "error", title: "Generation failed", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!message.trim() || !html) return;

    setChat(prev => [...prev, { role: "user", content: message }]);
    const instruction = message;
    setMessage("");
    setEditing(true);

    try {
      const res = await fetch(`${api}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, instruction }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        addToast({ type: "error", title: "Edit failed", message: err.detail || "Couldn't apply that change." });
        return;
      }

      const data = await res.json();
      setHtml(data.html);
      setChat(prev => [...prev, { role: "assistant", content: "Updated your portfolio." }]);
    } catch (error) {
      addToast({ type: "error", title: "Edit failed", message: error.message });
    } finally {
      setEditing(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio.html";
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: "info", title: "Downloaded", message: "portfolio.html saved to your device." });
  };

  const handleDeploy = async () => {
    if (!slug.trim() || !html) return;
    setDeploying(true);

    try {
      const res = await fetch(`${api}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast({ type: "error", title: "Deploy failed", message: data.detail || "Couldn't deploy that name." });
        return;
      }

      setDeployedUrl(data.url);
      addToast({
        type: "success",
        title: "Portfolio deployed",
        message: "Save this delete token now — it won't be shown again.",
        copyValue: data.delete_token,
        persist: true,
      });
    } catch (error) {
      addToast({ type: "error", title: "Deploy failed", message: error.message });
    } finally {
      setDeploying(false);
    }
  };

  const handleDeleteSite = async () => {
    if (!manageSlug.trim() || !manageToken.trim()) return;
    setDeletingSite(true);

    try {
      const res = await fetch(
        `${api}/p/${manageSlug.trim()}?token=${encodeURIComponent(manageToken.trim())}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        addToast({ type: "error", title: "Delete failed", message: data.detail || "Couldn't delete that portfolio." });
        return;
      }

      addToast({ type: "success", title: "Portfolio deleted", message: `${manageSlug.trim()} has been taken down.` });
      if (deployedUrl.endsWith(`/p/${manageSlug.trim()}`)) setDeployedUrl("");
      setManageSlug("");
      setManageToken("");
    } catch (error) {
      addToast({ type: "error", title: "Delete failed", message: error.message });
    } finally {
      setDeletingSite(false);
    }
  };

  const handleReset = () => {
    setHtml("");
    setChat([]);
    setMessage("");
    setSlug("");
    setDeployedUrl("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header showReset={!!html} onReset={handleReset} />

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {loading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Loader />
          </div>
        ) : !html ? (
          <Landing handleUpload={handleUpload} />
        ) : (
          <Editor
            html={html}
            chat={chat}
            message={message}
            setMessage={setMessage}
            handleEdit={handleEdit}
            editing={editing}
            handleDownload={handleDownload}
            slug={slug}
            setSlug={setSlug}
            deployedUrl={deployedUrl}
            deploying={deploying}
            handleDeploy={handleDeploy}
            manageSlug={manageSlug}
            setManageSlug={setManageSlug}
            manageToken={manageToken}
            setManageToken={setManageToken}
            deletingSite={deletingSite}
            handleDeleteSite={handleDeleteSite}
          />
        )}
      </div>

      {!html && <Footer />}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}