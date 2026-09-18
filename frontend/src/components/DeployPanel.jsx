import { useState } from "react";
import styled from "styled-components";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
`;

const Title = styled.h3`
  margin: 0;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
`;

const Hint = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 13px;
  font-family: var(--font-mono);
  &:focus { outline: none; border-color: var(--steel); }
  &::placeholder { color: var(--text-muted); }
`;

const PrimaryBtn = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: var(--ember);
  color: #1a0f08;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: filter 0.15s ease;
  &:hover:not(:disabled) { filter: brightness(1.12); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const DangerBtn = styled(PrimaryBtn)`
  background: transparent;
  border: 1px solid var(--danger);
  color: var(--danger);
  &:hover:not(:disabled) { background: rgba(239,68,68,0.1); filter: none; }
`;

const LiveLink = styled.a`
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--mint);
  word-break: break-all;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const Confirm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.25);
  border-radius: 8px;
  padding: 10px;
`;

const ConfirmText = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--danger);
`;

const ConfirmRow = styled.div`
  display: flex;
  gap: 6px;
`;

const GhostBtn = styled(PrimaryBtn)`
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  &:hover:not(:disabled) { border-color: var(--steel); filter: none; }
`;

export default function DeployPanel({
  user, onSignIn,
  deployedUrl, setDeployedUrl,
  slug, setSlug,
  deploying, setDeploying,
  files, addToast,
  session_id,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const api = process.env.REACT_APP_API_URL;

  const handleDeploy = async () => {
    if (!slug.trim() || !files) return;

    if (!user) {
      addToast({ type: "info", title: "Sign in required", message: "Sign in to deploy your portfolio." });
      onSignIn();
      return;
    }

    setDeploying(true);
    try {
      const { data: sessionData } = await import("../supabaseClient").then(m => m.supabase.auth.getSession());
      const token = sessionData.session?.access_token;

      const html = (await import("../utils/assemblePreview")).assemblePreviewHTML(files);

      const res = await fetch(`${api}/deploy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ html, slug: slug.trim(), session_id }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast({ type: "error", title: "Deploy failed", message: data.detail || "Couldn't deploy." });
        return;
      }

      setDeployedUrl(data.url);
      addToast({ type: "success", title: "Portfolio deployed!", message: `Live at ${data.url}` });
    } catch (err) {
      addToast({ type: "error", title: "Deploy failed", message: err.message });
    } finally {
      setDeploying(false);
    }
  };

  const handleDelete = async () => {
    if (!user) { onSignIn(); return; }
    setDeleting(true);
    try {
      const { supabase } = await import("../supabaseClient");
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const slugToDelete = deployedUrl.split("/p/")[1];

      const res = await fetch(`${api}/p/${slugToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        addToast({ type: "error", title: "Delete failed", message: data.detail });
        return;
      }

      setDeployedUrl("");
      setSlug("");
      setConfirmDelete(false);
      addToast({ type: "success", title: "Portfolio deleted", message: `${slugToDelete} has been taken down.` });
    } catch (err) {
      addToast({ type: "error", title: "Delete failed", message: err.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Wrap>
      <Title>🚀 Deploy</Title>

      {deployedUrl ? (
        <>
          <Hint>Your portfolio is live at:</Hint>
          <LiveLink href={deployedUrl} target="_blank" rel="noopener noreferrer">{deployedUrl}</LiveLink>

          {!confirmDelete ? (
            <DangerBtn onClick={() => setConfirmDelete(true)} style={{ marginTop: 4 }}>
              Take down portfolio
            </DangerBtn>
          ) : (
            <Confirm>
              <ConfirmText>This permanently removes the live link. Are you sure?</ConfirmText>
              <ConfirmRow>
                <DangerBtn onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Yes, delete it"}
                </DangerBtn>
                <GhostBtn onClick={() => setConfirmDelete(false)}>Cancel</GhostBtn>
              </ConfirmRow>
            </Confirm>
          )}
        </>
      ) : (
        <>
          <Hint>
            {user
              ? "Pick a name for your live link."
              : "Sign in first, then deploy — it only takes a second."}
          </Hint>
          {user ? (
            <Row>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="your-name"
                disabled={deploying}
              />
              <PrimaryBtn onClick={handleDeploy} disabled={deploying || !slug.trim()}>
                {deploying ? "Deploying..." : "Deploy"}
              </PrimaryBtn>
            </Row>
          ) : (
            <PrimaryBtn onClick={onSignIn}>Sign in to deploy</PrimaryBtn>
          )}
        </>
      )}
    </Wrap>
  );
}