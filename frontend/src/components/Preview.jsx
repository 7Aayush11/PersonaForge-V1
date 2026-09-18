import { useState } from "react";
import styled from "styled-components";
import { useSelfHealingPreview } from "../hooks/useSelfHealing";
import EditModal from "./EditModal";
import DeployPanel from "./DeployPanel";

const Layout = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const PreviewPane = styled.div`
  flex: 1;
  background: var(--surface);
  position: relative;
`;

const PreviewFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const HealingBanner = styled.div`
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  white-space: nowrap;
`;

const Sidebar = styled.div`
  width: 280px;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--border);
  background: var(--bg-void);
  overflow-y: auto;
`;

const SidebarSection = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
`;

const SectionTitle = styled.h3`
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

const DownloadBtn = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { border-color: var(--steel); }
`;

export default function Preview({
  files, setFiles, addToast, handleEdit, editing,
  user, onSignIn, session_id,
}) {
  const { previewHtml, isHealing } = useSelfHealingPreview(files, setFiles, addToast);
  const [slug, setSlug] = useState("");
  const [deployedUrl, setDeployedUrl] = useState("");
  const [deploying, setDeploying] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio.html";
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: "info", title: "Downloaded", message: "portfolio.html saved to your device." });
  };

  return (
    <Layout>
      <PreviewPane>
        <PreviewFrame srcDoc={previewHtml} title="Portfolio Preview" />
        {isHealing && <HealingBanner>✦ Fixing an issue automatically…</HealingBanner>}
      </PreviewPane>

      <Sidebar>
        <SidebarSection>
          <SectionTitle>✎ Edit</SectionTitle>
          <Hint>Describe what you want changed in plain English. The preview updates automatically.</Hint>
        </SidebarSection>

        <SidebarSection style={{ borderBottom: "none", flex: 1 }} />

        <SidebarSection>
          <SectionTitle>↓ Download</SectionTitle>
          <Hint>Save the page as a self-contained HTML file for manual hosting.</Hint>
          <DownloadBtn onClick={handleDownload}>Download portfolio</DownloadBtn>
        </SidebarSection>

        <DeployPanel
          user={user}
          onSignIn={onSignIn}
          deployedUrl={deployedUrl}
          setDeployedUrl={setDeployedUrl}
          slug={slug}
          setSlug={setSlug}
          deploying={deploying}
          setDeploying={setDeploying}
          files={files}
          addToast={addToast}
          session_id={session_id}
        />
      </Sidebar>

      <EditModal handleEdit={handleEdit} editing={editing} />
    </Layout>
  );
}