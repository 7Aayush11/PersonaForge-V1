import { useState } from "react";
import styled from "styled-components";
import { compressImageFile } from "../utils/imageSlots";

const Wrap = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 10px;
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

const SlotList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SlotRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Thumb = styled.img`
  width: 38px;
  height: 38px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
`;

const SlotLabel = styled.span`
  flex: 1;
  font-size: 12px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UploadBtn = styled.label`
  font-size: 11px;
  font-weight: 600;
  background: var(--steel-soft);
  color: var(--steel);
  border-radius: 6px;
  padding: 5px 10px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: filter 0.15s ease;
  &:hover { filter: brightness(1.2); }
  input { display: none; }
`;

const StatusDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${p => p.$uploading ? "var(--ember)" : p.$done ? "var(--mint)" : "var(--border)"};
  flex-shrink: 0;
`;

export default function ImageUploadPanel({ imageSlots, sessionId, onFilesUpdated, addToast }) {
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [doneSlots, setDoneSlots] = useState(new Set());

  const api = process.env.REACT_APP_API_URL;

  const handleUpload = async (slotId, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast({ type: "error", title: "Invalid file", message: "Please choose an image file." });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      addToast({ type: "error", title: "File too large", message: "Please choose an image under 15 MB." });
      return;
    }

    setUploadingSlot(slotId);
    try {
      const dataUrl = await compressImageFile(file, 800, 0.82);

      const res = await fetch(`${api}/upload-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          slot_id: slotId,
          data_url: dataUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast({ type: "error", title: "Upload failed", message: data.detail || "Couldn't upload that image." });
        return;
      }

      // Update local files state so preview re-renders with the new image
      if (onFilesUpdated && data.updated_files) {
        onFilesUpdated(data.updated_files);
      }

      setDoneSlots(prev => new Set([...prev, slotId]));
      addToast({ type: "success", title: "Photo updated", message: `${slotId} updated successfully.` });

    } catch (err) {
      addToast({ type: "error", title: "Upload failed", message: err.message });
    } finally {
      setUploadingSlot(null);
    }
  };

  if (!imageSlots || imageSlots.length === 0) {
    return (
      <Wrap>
        <Title>📷 Photos</Title>
        <Hint>No image slots found in this portfolio.</Hint>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <Title>📷 Photos</Title>
      <Hint>
        Replace placeholder images with your own. Photos are compressed in your browser and
        embedded directly — nothing is stored separately.
      </Hint>
      <SlotList>
        {imageSlots.map((slot) => (
          <SlotRow key={slot.slotId}>
            <StatusDot
              $uploading={uploadingSlot === slot.slotId}
              $done={doneSlots.has(slot.slotId)}
            />
            <Thumb
              src={slot.src}
              alt={slot.label}
              onError={(e) => { e.target.src = "https://placehold.co/38x38?text=?"; }}
            />
            <SlotLabel title={slot.label}>{slot.label}</SlotLabel>
            <UploadBtn>
              {uploadingSlot === slot.slotId ? "…" : "Replace"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) handleUpload(slot.slotId, f);
                  e.target.value = "";
                }}
                disabled={uploadingSlot !== null}
              />
            </UploadBtn>
          </SlotRow>
        ))}
      </SlotList>
    </Wrap>
  );
}