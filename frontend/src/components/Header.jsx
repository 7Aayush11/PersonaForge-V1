import styled from 'styled-components';

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  background: rgba(11, 14, 20, 0.75);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Spark = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ember);
  box-shadow: 0 0 10px var(--ember);
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 0.5; transform: scale(0.9); }
    50% { opacity: 1; transform: scale(1.2); }
  }
`;

const Wordmark = styled.span`
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  letter-spacing: -0.02em;
  color: var(--text-primary);
`;

const Tagline = styled.span`
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  display: none;
  @media (min-width: 640px) { display: inline; }
`;

const StartOver = styled.button`
  font-size: 13px;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid var(--border);
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-primary);
    border-color: var(--steel);
  }
`;

export default function Header({ showReset, onReset }) {
  return (
    <Bar>
      <Brand>
        <Spark />
        <Wordmark>PersonaForge</Wordmark>
        <Tagline>// forge your identity</Tagline>
      </Brand>
      {showReset && <StartOver onClick={onReset}>Start over</StartOver>}
    </Bar>
  );
}