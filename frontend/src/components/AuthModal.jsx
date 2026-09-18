import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AuthModal({ onClose, addToast }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendLink = async () => {
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setLoading(false);
    if (error) {
      addToast({ type: "error", title: "Couldn't send link", message: error.message });
      return;
    }
    setSent(true);
  };

  const handleOAuth = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      addToast({ type: "error", title: "Sign-in failed", message: error.message });
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: "var(--surface-raised)", padding: 24, borderRadius: 12, width: 320, display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ color: "var(--text-primary)", margin: 0 }}>Sign in to save and manage your portfolios.</p>

        <button onClick={() => handleOAuth("google")} style={{ padding: 9, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", cursor: "pointer" }}>
          Continue with Google
        </button>
        <button onClick={() => handleOAuth("github")} style={{ padding: 9, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", cursor: "pointer" }}>
          Continue with GitHub
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 12 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          or
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {sent ? (
          <p style={{ color: "var(--text-primary)" }}>Check your email for a sign-in link.</p>
        ) : (
          <>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ padding: 9, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}
            />
            <button onClick={handleSendLink} disabled={loading || !email.trim()} style={{ padding: 9, borderRadius: 8, border: "none", background: "var(--steel)", cursor: "pointer" }}>
              {loading ? "Sending..." : "Send sign-in link"}
            </button>
          </>
        )}

        <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>Close</button>
      </div>
    </div>
  );
}