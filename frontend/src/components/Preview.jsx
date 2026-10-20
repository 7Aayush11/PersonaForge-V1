import React, { useEffect, useState } from "react";
import styled from "styled-components";
import EditModal from "./EditModal";
import { downloadPortfolioZip } from "../utils/downloadZip";
import ImageUploadPanel from "./ImageUploadPanel";
import { extractImageSlotsFromFiles } from "../utils/imageSlots";

// ─── Styled components ────────────────────────────────────────────────────────

const Layout = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #0b0e14;
`;

const Sidebar = styled.aside`
  width: 300px;
  flex-shrink: 0;
  background: #141a24;
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  }
`;

const SidebarSection = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
  }
`;

const SectionLabel = styled.p`
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8b95a7;
  margin: 0 0 12px;
`;

const EditCounter = styled.p`
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 12px;
  color: #8b95a7;
  margin: 8px 0 0;

  strong {
    color: #e6eef8;
  }
`;

const PreviewFrame = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;
`;

const IframeWrap = styled.div`
  width: 100%;
  height: 100%;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: #fff;
  }
`;

const ActionBtn = styled.button`
  width: 100%;
  background: ${(p) =>
    p.$primary
      ? "#FF6B35"
      : p.$danger
      ? "rgba(239,68,68,0.12)"
      : "rgba(255,255,255,0.05)"};
  border: ${(p) =>
    p.$primary
      ? "none"
      : p.$danger
      ? "1px solid rgba(239,68,68,0.25)"
      : "1px solid rgba(255,255,255,0.08)"};
  color: ${(p) =>
    p.$primary ? "#fff" : p.$danger ? "#EF4444" : "#8b95a7"};
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 13px;
  font-weight: 600;
  padding: 9px 14px;
  border-radius: 8px;
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.disabled ? 0.5 : 1)};
  transition: opacity 0.15s, background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-bottom: 8px;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const LockedBtn = styled.button`
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #8b95a7;
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 13px;
  font-weight: 600;
  padding: 9px 14px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-bottom: 8px;
  position: relative;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 107, 53, 0.08);
    color: #ff6b35;
    border-color: rgba(255, 107, 53, 0.2);
  }
`;

const Tooltip = styled.span`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #1c2430;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e6eef8;
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 7px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;

  ${LockedBtn}:hover & {
    opacity: 1;
  }
`;

const SlugInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  color: #e6eef8;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 13px;
  outline: none;
  margin-bottom: 10px;
  box-sizing: border-box;

  &::placeholder {
    color: #4a5568;
  }

  &:focus {
    border-color: rgba(255, 107, 53, 0.45);
  }
`;

const DeployedLink = styled.a`
  display: block;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 11px;
  color: #4a9dec;
  text-decoration: none;
  word-break: break-all;
  margin-bottom: 10px;

  &:hover {
    text-decoration: underline;
  }
`;

const BackBtn = styled.button`
  background: none;
  border: none;
  color: #8b95a7;
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 13px;
  padding: 14px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.15s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:hover {
    color: #e6eef8;
  }
`;

const StatusDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${(p) => (p.$ok ? "#1ABC9C" : "#8b95a7")};
  display: inline-block;
  flex-shrink: 0;
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Preview({
  files,
  assembledHtml,
  setAssembledHtml,
  session_id,
  setFiles,
  user,
  slug,
  setSlug,
  deployedUrl,
  deploying,
  onDeploy,
  onDelete,
  onEdit,
  isEditing,
  onBack,
  entitlements,
  onUpgrade,
  addToast,
}) {
  const [previewSrc, setPreviewSrc] = useState(null);

  const isPremium = entitlements?.tier === "premium";
  const isFreeTier = entitlements?.tier === "free";
  const canDeploy = !!user;

  const weeklyEditsUsed = entitlements?.weekly_edits_used ?? 0;
  const weeklyEditsLimit = entitlements?.weekly_edits_limit ?? 3;
  const imageSlots = extractImageSlotsFromFiles(files);

  // Create and revoke the preview URL whenever the generated HTML changes.
  useEffect(() => {
    const html = assembledHtml || (files && (
      files["index.html"] ||
      Object.values(files).find((value) => typeof value === "string" && /<html|<!doctype html/i.test(value))
    ));
    if (!html) {
      setPreviewSrc(null);
      return undefined;
    }
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    setPreviewSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [files, assembledHtml]);

  const handleDownload = () => {
    if (!isPremium) {
      onUpgrade && onUpgrade();
      return;
    }
    downloadPortfolioZip(files, addToast);
  };


  return (
    <Layout>
      <Sidebar>
        <BackBtn onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </BackBtn>

        {/* Download */}
        <SidebarSection>
          <SectionLabel>Download</SectionLabel>
          {isPremium ? (
            <ActionBtn onClick={handleDownload}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download ZIP
            </ActionBtn>
          ) : (
            <LockedBtn onClick={handleDownload}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Download ZIP
              <Tooltip>Premium only — click to upgrade</Tooltip>
            </LockedBtn>
          )}
        </SidebarSection>

        {/* Deploy */}
        <SidebarSection>
          <SectionLabel>Deploy</SectionLabel>
          {deployedUrl && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <StatusDot $ok />
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#1ABC9C" }}>Live</span>
              </div>
              <DeployedLink href={deployedUrl} target="_blank" rel="noopener noreferrer">
                {deployedUrl.replace(/^https?:\/\//, "")}
              </DeployedLink>
            </>
          )}

          <SlugInput
            value={slug}
            onChange={(e) => setSlug && setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="your-slug"
            disabled={!canDeploy}
          />

          <ActionBtn
            $primary
            onClick={onDeploy}
            disabled={!canDeploy || deploying || !slug}
          >
            {deploying ? "Deploying…" : deployedUrl ? "Redeploy" : "Deploy"}
          </ActionBtn>

          {deployedUrl && (
            <ActionBtn $danger onClick={onDelete} disabled={deploying}>
              Delete deployment
            </ActionBtn>
          )}

          {!user && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#8b95a7", margin: "8px 0 0" }}>
              Sign in to deploy
            </p>
          )}
        </SidebarSection>

        {/* Photo upload */}
        <ImageUploadPanel
          imageSlots={imageSlots}
          sessionId={session_id}
          onFilesUpdated={(updatedFiles) => {
            if (setFiles) setFiles(updatedFiles);
          }}
          onAssembledHtmlUpdated={(html) => {
            if (setAssembledHtml) setAssembledHtml(html);
          }}
          addToast={addToast}
        />

        {/* Edit section label with counter */}
        <SidebarSection>
          <SectionLabel>Edit</SectionLabel>
          {isFreeTier && (
            <EditCounter>
              <strong>{weeklyEditsUsed}</strong>/{weeklyEditsLimit} edits this week
            </EditCounter>
          )}
        </SidebarSection>
      </Sidebar>

      <PreviewFrame>
        {previewSrc ? (
          <IframeWrap>
            <iframe
              src={previewSrc}
              title="Portfolio preview"
              sandbox="allow-scripts"
            />
          </IframeWrap>
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8b95a7",
              fontFamily: "var(--font-body)",
              fontSize: 14,
            }}
          >
            No preview available
          </div>
        )}
      </PreviewFrame>

      <EditModal
        onEdit={onEdit}
        isEditing={isEditing}
        entitlements={entitlements}
        onUpgrade={onUpgrade}
      />
    </Layout>
  );
}