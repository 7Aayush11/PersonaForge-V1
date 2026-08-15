import { useEffect, useState } from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 360px;
`;

const Card = styled.div`
  position: relative;
  background: var(--surface-raised);
  border: 1px solid ${p => p.$accent};
  border-left: 3px solid ${p => p.$accent};
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  animation: slideIn 0.25s ease;

  @keyframes slideIn {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const Title = styled.p`
  margin: 0 0 4px 0;
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
  padding-right: 16px;
`;

const Message = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
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
`;

const TokenText = styled.code`
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ember);
  flex: 1;
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

  &:hover { filter: brightness(1.2); }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 12px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
`;

const accentFor = (type) => {
  if (type === 'success') return 'var(--mint)';
  if (type === 'error') return 'var(--danger)';
  return 'var(--steel)';
};

function ToastCard({ toast, onDismiss }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (toast.persist) return;
    const t = setTimeout(() => onDismiss(toast.id), toast.duration || 6000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(toast.copyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // clipboard unavailable, ignore
    }
  };

  return (
    <Card $accent={accentFor(toast.type)}>
      <CloseBtn onClick={() => onDismiss(toast.id)}>&times;</CloseBtn>
      <Title>{toast.title}</Title>
      {toast.message && <Message>{toast.message}</Message>}
      {toast.copyValue && (
        <TokenRow>
          <TokenText>{toast.copyValue}</TokenText>
          <CopyBtn onClick={handleCopy}>{copied ? 'Copied' : 'Copy'}</CopyBtn>
        </TokenRow>
      )}
    </Card>
  );
}

export default function ToastStack({ toasts, onDismiss }) {
  return (
    <Wrap>
      {toasts.map(t => <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />)}
    </Wrap>
  );
}