import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { supabase } from "../supabaseClient";
import { assemblePreviewHTML } from "../utils/assemblePreview";

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const slideUp = keyframes`from { transform: translateY(16px) translateX(-50%); opacity: 0; } to { transform: translateY(0) translateX(-50%); opacity: 1; }`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  z-index: 100;
  animation: ${fadeIn} 0.2s ease;
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
  width: min(440px, calc(100vw - 32px));
  z-index: 101;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5);
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
`;

const ModalHint = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
`;

const SlugRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  &:focus-within { border-color: var(--steel); }
`;

const SlugPrefix = styled.span`
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
  padding: 10px 10px 10px 14px;
  white-space: nowrap;
  background: var(--surface);
  border-right: 1px solid var(--border);
`;

const SlugInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 13px;
  &:focus { outline: none; }
  &::placeholder { color: var(--text-muted); }
`;

const PrimaryBtn = styled.button`
  padding: 11px 20px;
  border-radius: 10px;
  border: none;
  background: var(--ember);
  color: #1a0f08;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: filter 0.15s ease;
  &:hover:not(:disabled) { filter: brightness(1.1); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const GhostBtn = styled(PrimaryBtn)`
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  &:hover:not(:disabled) { border-color: var(--steel); filter: none; color: var(--text-primary); }
`;

const BtnRow = styled.div`
  display: flex;
  gap: 8px;
`;

const SuccessBox = styled.div`
  background: rgba(26, 188, 156, 0.08);
  border: 1px solid rgba(26, 188, 156, 0.3);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LiveLink = styled.a`
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--mint);
  word-break: break-all;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const SuccessNote = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
`;

export default function DeployModal({ files, user, onSignIn, onClose, onDeployed, session_id, addToast }) {
  const [slug, setSlug] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState("");

  const api = process.env.REACT_APP_API_URL;
  const backendBase = api;

  const handleDeploy = async () => {
    if (!slug.trim()) return;
    if (!user) { onSignIn(); return; }

    setDeploying(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const html = assemblePreviewHTML(files);

      const res = await fetch(`${backendBase}/deploy`, {
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
      if (onDeployed) onDeployed(data.url, slug.trim());
    } catch (err) {
      addToast({ type: "error", title: "Deploy failed", message: err.message });
    } finally {
      setDeploying(false);
    }
  };

  return (
    <>
      <Overlay onClick={onClose} />
      <Modal>
        <ModalTitle>🚀 Deploy your portfolio</ModalTitle>

        {!deployedUrl ? (
          <>
            <ModalHint>
              Choose a name for your live link. It goes live instantly — no hosting setup needed.
            </ModalHint>
            <SlugRow>
              <SlugPrefix>{backendBase}/p/</SlugPrefix>
              <SlugInput
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="your-name"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleDeploy(); }}
              />
            </SlugRow>
            <BtnRow>
              <PrimaryBtn onClick={handleDeploy} disabled={deploying || !slug.trim()} style={{ flex: 1 }}>
                {deploying ? "Deploying…" : "Deploy now"}
              </PrimaryBtn>
              <GhostBtn onClick={onClose}>Cancel</GhostBtn>
            </BtnRow>
          </>
        ) : (
          <>
            <SuccessBox>
              <span style={{ fontSize: 13, color: "var(--mint)", fontWeight: 600 }}>✓ Live</span>
              <LiveLink href={deployedUrl} target="_blank" rel="noopener noreferrer">{deployedUrl}</LiveLink>
              <SuccessNote>Manage and delete this portfolio from your Dashboard.</SuccessNote>
            </SuccessBox>
            <BtnRow>
              <PrimaryBtn onClick={onClose} style={{ flex: 1 }}>Done</PrimaryBtn>
            </BtnRow>
          </>
        )}
      </Modal>
    </>
  );
}