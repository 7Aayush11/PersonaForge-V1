import styled from 'styled-components';
import { useSelfHealingPreview } from '../hooks/useSelfHealing';
import EditModal from './EditModal';
const Layout = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const PreviewPane = styled.div`
  flex: 1;
  background: var(--surface);
`;

const PreviewFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

export default function Preview({
  files, setFiles, addToast, handleEdit, editing
}) {
  const {previewHtml, isHealing} = useSelfHealingPreview(files, setFiles, addToast)
  console.log("ASSEMBLED PREVIEW:", previewHtml);
  return (
    <Layout>
      <PreviewPane>
        <PreviewFrame srcDoc={previewHtml} title="Portfolio Preview" />
        {isHealing && <div>Fixing an issue automatically…</div>}
      </PreviewPane>
      <section className="preview-chat-section">
        <EditModal handleEdit={handleEdit} editing={editing}/>
      </section>
    </Layout>
  );
}