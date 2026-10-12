import React, { useState, useRef } from "react";
import styled from "styled-components";

// ─── Styled components ────────────────────────────────────────────────────────

const Bar = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: min(680px, calc(100vw - 32px));
  background: #1c2430;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 12px 12px 12px 16px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.45);
  z-index: 200;
`;

const TextArea = styled.textarea`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  color: #e6eef8;
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 14px;
  line-height: 1.5;
  min-height: 40px;
  max-height: 160px;
  padding: 8px 0;

  &::placeholder {
    color: #4a5568;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

const SendBtn = styled.button`
  background: #ff6b35;
  border: none;
  border-radius: 10px;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s, transform 0.1s;
  color: #fff;

  &:hover:not(:disabled) {
    opacity: 0.88;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const LockedOverlay = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
`;

const LockIcon = styled.span`
  font-size: 16px;
  color: #8b95a7;
`;

const LockedText = styled.p`
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 13px;
  color: #8b95a7;
  margin: 0;
`;

const UpgradeLink = styled.button`
  background: none;
  border: none;
  color: #ff6b35;
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    opacity: 0.8;
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditModal({
  onEdit,
  isEditing,
  entitlements,
  onUpgrade,
}) {
  const [text, setText] = useState("");
  const ref = useRef(null);

  const canEdit = entitlements?.can_edit !== false;

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || isEditing) return;
    try {
      await onEdit(trimmed);
      setText("");
      if (ref.current) ref.current.style.height = "auto";
    } catch (error) {
      // Preserve the instruction so the user can retry after a failed edit.
      console.error("Portfolio edit failed:", error);
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    // Auto-grow
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 160)}px`;
    }
  };

  return (
    <Bar>
      {canEdit ? (
        <>
          <TextArea
            ref={ref}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKey}
            placeholder={
              isEditing ? "Applying your edit…" : "Describe a change to your portfolio…"
            }
            disabled={isEditing}
            rows={1}
          />
          <SendBtn
            onClick={submit}
            disabled={!text.trim() || isEditing}
            aria-label="Send edit"
          >
            {isEditing ? (
              // Spinner
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                </path>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </SendBtn>
        </>
      ) : (
        <>
          <LockedOverlay>
            <LockIcon>🔒</LockIcon>
            <LockedText>
              Edits are locked on your current plan.{" "}
              <UpgradeLink onClick={onUpgrade}>Upgrade to edit</UpgradeLink>
            </LockedText>
          </LockedOverlay>
          <SendBtn disabled aria-label="Edit locked">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </SendBtn>
        </>
      )}
    </Bar>
  );
}