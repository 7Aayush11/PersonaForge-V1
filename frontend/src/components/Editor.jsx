import styled from 'styled-components';
import { assemblePreviewHTML } from '../utils/assemblePreview';
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

// const Sidebar = styled.div`
//   width: 380px;
//   min-width: 340px;
//   display: flex;
//   flex-direction: column;
//   border-left: 1px solid var(--border);
//   background: var(--bg-void);
//   overflow-y: auto;
// `;

// const Section = styled.div`
//   padding: 18px 20px;
//   border-bottom: 1px solid var(--border);
//   display: flex;
//   flex-direction: column;
//   gap: 10px;
//   flex-shrink: 0;
// `;

// const SectionTitle = styled.h3`
//   margin: 0;
//   font-family: var(--font-display);
//   font-size: 14px;
//   font-weight: 600;
// `;

// const SectionHint = styled.p`
//   margin: 0;
//   font-size: 12px;
//   color: var(--text-muted);
//   line-height: 1.5;
// `;

// const ChatSection = styled.div`
//   flex: 1;
//   display: flex;
//   flex-direction: column;
//   min-height: 200px;
// `;

// const ChatLog = styled.div`
//   flex: 1;
//   overflow-y: auto;
//   padding: 16px 20px;
//   display: flex;
//   flex-direction: column;
//   gap: 10px;
// `;

// const Bubble = styled.div`
//   align-self: ${p => (p.$user ? 'flex-end' : 'flex-start')};
//   background: ${p => (p.$user ? 'var(--ember)' : 'var(--surface-raised)')};
//   color: ${p => (p.$user ? '#1a0f08' : 'var(--text-primary)')};
//   padding: 9px 13px;
//   border-radius: 12px;
//   max-width: 85%;
//   font-size: 13px;
//   line-height: 1.45;
//   word-wrap: break-word;
// `;

// const ChatInputRow = styled.div`
//   padding: 12px 20px;
//   border-top: 1px solid var(--border);
//   display: flex;
//   gap: 8px;
//   flex-shrink: 0;
// `;

// const TextInput = styled.input`
//   flex: 1;
//   padding: 9px 12px;
//   border-radius: 8px;
//   border: 1px solid var(--border);
//   background: var(--surface);
//   color: var(--text-primary);
//   font-size: 13px;

//   &:focus { outline: none; border-color: var(--steel); }
//   &::placeholder { color: var(--text-muted); }
// `;

// const PrimaryBtn = styled.button`
//   padding: 9px 16px;
//   border-radius: 8px;
//   border: none;
//   background: var(--steel);
//   color: #061424;
//   font-weight: 600;
//   font-size: 13px;
//   cursor: pointer;
//   white-space: nowrap;
//   transition: filter 0.15s ease;

//   &:hover:not(:disabled) { filter: brightness(1.12); }
//   &:disabled { opacity: 0.5; cursor: not-allowed; }
// `;

// const DeployBtn = styled(PrimaryBtn)`
//   background: var(--ember);
//   color: #1a0f08;
// `;

// const DangerBtn = styled(PrimaryBtn)`
//   background: transparent;
//   border: 1px solid var(--danger);
//   color: var(--danger);

//   &:hover:not(:disabled) { background: rgba(239, 68, 68, 0.1); filter: none; }
// `;

// const GhostBtn = styled(PrimaryBtn)`
//   background: transparent;
//   border: 1px solid var(--border);
//   color: var(--text-primary);

//   &:hover:not(:disabled) { border-color: var(--steel); filter: none; }
// `;

// const LiveLink = styled.a`
//   font-family: var(--font-mono);
//   font-size: 12px;
//   color: var(--mint);
//   word-break: break-all;
// `;

// const ImageList = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 10px;
// `;

// const ImageRow = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 10px;
// `;

// const Thumb = styled.img`
//   width: 40px;
//   height: 40px;
//   border-radius: 8px;
//   object-fit: cover;
//   border: 1px solid var(--border);
//   flex-shrink: 0;
//   background: var(--surface);
// `;

// const ImageLabel = styled.span`
//   flex: 1;
//   font-size: 12px;
//   color: var(--text-primary);
// `;

// const UploadLabel = styled.label`
//   font-size: 11px;
//   font-weight: 600;
//   background: var(--steel-soft);
//   color: var(--steel);
//   border-radius: 6px;
//   padding: 6px 10px;
//   cursor: pointer;
//   white-space: nowrap;

//   input { display: none; }

//   &:hover { filter: brightness(1.2); }
// `;


export default function Editor({
  files
}) {
  const previewHtml = assemblePreviewHTML(files);
  console.log("ASSEMBLED PREVIEW:", previewHtml);
  return (
    <Layout>
      <PreviewPane>
        <PreviewFrame srcDoc={assemblePreviewHTML(files)} title="Portfolio Preview" />
      </PreviewPane>

      {/* <Sidebar>
        <ChatSection>
          <Section>
            <SectionTitle>&#9998; Edit</SectionTitle>
            <SectionHint>
              Describe what you want changed, in plain English &mdash; e.g. "make the header dark blue"
              or "add a projects section." Each message rewrites the preview on the left.
            </SectionHint>
          </Section>

          <ChatLog>
            {chat.length === 0 && <SectionHint>No edits yet. Try telling it what to change above.</SectionHint>}
            {chat.map((msg, i) => <Bubble key={i} $user={msg.role === 'user'}>{msg.content}</Bubble>)}
            {editing && <Bubble $user={false}>Updating your portfolio&hellip;</Bubble>}
          </ChatLog>

          <ChatInputRow>
            <TextInput
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(); }}
              placeholder="e.g. make the header dark blue"
              disabled={editing}
            />
            <PrimaryBtn onClick={handleEdit} disabled={editing || !message.trim()}>
              {editing ? '...' : 'Send'}
            </PrimaryBtn>
          </ChatInputRow>
        </ChatSection>

        <Section>
          <SectionTitle>&#128247; Photos</SectionTitle>
          <SectionHint>
            Replace any placeholder photo with your own. Images are resized in your browser
            and only become part of the page &mdash; nothing is uploaded to us unless you deploy.
          </SectionHint>
          {(!imageSlots || imageSlots.length === 0) ? (
            <SectionHint>No photo placeholders found in this portfolio.</SectionHint>
          ) : (
            <ImageList>
              {imageSlots.map((slot) => (
                <ImageRow key={slot.slotId}>
                  <Thumb src={slot.src} alt={slot.label} />
                  <ImageLabel>{slot.label}</ImageLabel>
                  <UploadLabel>
                    {uploadingSlot === slot.slotId ? '...' : 'Replace'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) onImageUpload(slot.slotId, file);
                        e.target.value = "";
                      }}
                    />
                  </UploadLabel>
                </ImageRow>
              ))}
            </ImageList>
          )}
        </Section>

        <Section>
          <SectionTitle>&#8681; Download</SectionTitle>
          <SectionHint>Save the HTML/CSS/JS file to your device, or host it anywhere you like.</SectionHint>
          <GhostBtn onClick={handleDownload}>Download portfolio</GhostBtn>
        </Section>

        <Section>
          <SectionTitle>&#128640; Deploy</SectionTitle>
          {deployedUrl ? (
            <>
              <SectionHint>Your portfolio is live at:</SectionHint>
              <LiveLink href={deployedUrl} target="_blank" rel="noopener noreferrer">{deployedUrl}</LiveLink>
            </>
          ) : (
            <>
              <SectionHint>Choose a name for your link &mdash; it goes live instantly, no account needed.</SectionHint>
              <div style={{ display: 'flex', gap: 8 }}>
                <TextInput
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="your-name"
                  disabled={deploying}
                />
                <DeployBtn onClick={handleDeploy} disabled={deploying || !slug.trim()}>
                  {deploying ? 'Deploying...' : 'Deploy'}
                </DeployBtn>
              </div>
            </>
          )}
        </Section>

        <Section style={{ borderBottom: 'none' }}>
          <SectionTitle>&#128465; Delete a portfolio</SectionTitle>
          <SectionHint>
            There's no account system, so deleting requires the delete token shown right
            after deploying. Lost it? There's currently no recovery &mdash; deploy under a new name.
          </SectionHint>
          <TextInput value={manageSlug} onChange={(e) => setManageSlug(e.target.value)} placeholder="slug to delete" />
          <TextInput value={manageToken} onChange={(e) => setManageToken(e.target.value)} placeholder="delete token" />
          <DangerBtn onClick={handleDeleteSite} disabled={deletingSite || !manageSlug.trim() || !manageToken.trim()}>
            {deletingSite ? 'Deleting...' : 'Delete portfolio'}
          </DangerBtn>
        </Section>
      </Sidebar> */}
    </Layout>
  );
}