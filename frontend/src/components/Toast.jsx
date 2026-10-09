import { useEffect, useState } from "react";
import styled from "styled-components";

const Wrap = styled.div`
  position: fixed;
  top: 84px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  width: min(360px, calc(100vw - 32px));
  max-height: calc(100vh - 108px);
  overflow-y: auto;
  pointer-events: none;

  @media (max-width: 640px) {
    top: 78px;
    right: 12px;
    width: calc(100vw - 24px);
    max-height: calc(100vh - 96px);
  }
`;

const Card = styled.div`
  position: relative;
  width: 100%;
  box-sizing: border-box;
  pointer-events: auto;
  background: var(--surface-raised);
  border: 1px solid ${(props) => props.$accent};
  border-left: 3px solid ${(props) => props.$accent};
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
  animation: slideIn 0.25s ease;
  overflow-wrap: anywhere;

  @keyframes slideIn {
    from {
      transform: translateY(-8px);
      opacity: 0;
    }

    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Title = styled.p`
  margin: 0 0 4px;
  padding-right: 24px;
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
`;

const Message = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.6;
  white-space: pre-wrap;
`;

const TokenRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 10px;
  min-width: 0;
`;

const TokenText = styled.code`
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ember);
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  white-space: nowrap;
`;

const CopyBtn = styled.button`
  font-size: 11px;
  font-weight: 600;
  background: var(--steel-soft);
  color: var(--steel);
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    filter: brightness(1.2);
  }

  &:focus-visible {
    outline: 2px solid var(--ember);
    outline-offset: 2px;
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 9px;
  right: 10px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;

  &:hover {
    background: var(--surface);
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--ember);
    outline-offset: 2px;
  }
`;

const accentFor = (type) => {
  if (type === "success") return "var(--mint)";
  if (type === "error") return "var(--danger)";
  return "var(--steel)";
};

function ToastCard({ toast, onDismiss }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (toast.persist) return undefined;

    const timer = setTimeout(
      () => onDismiss(toast.id),
      toast.duration || 6000
    );

    return () => clearTimeout(timer);
  }, [toast.id, toast.persist, toast.duration, onDismiss]);

  const handleCopy = async () => {
    if (!toast.copyValue) return;

    try {
      await navigator.clipboard.writeText(toast.copyValue);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    if (!copied) return undefined;

    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <Card
      $accent={accentFor(toast.type)}
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
    >
      <CloseBtn
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        &times;
      </CloseBtn>

      <Title>{toast.title}</Title>

      {toast.message && <Message>{toast.message}</Message>}

      {toast.copyValue && (
        <TokenRow>
          <TokenText>{toast.copyValue}</TokenText>
          <CopyBtn type="button" onClick={handleCopy}>
            {copied ? "Copied" : "Copy"}
          </CopyBtn>
        </TokenRow>
      )}
    </Card>
  );
}

export default function ToastStack({ toasts, onDismiss }) {
  return (
    <Wrap aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </Wrap>
  );
}