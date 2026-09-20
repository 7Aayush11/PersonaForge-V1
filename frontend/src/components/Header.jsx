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

const Wordmark = styled.nav`
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

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Btn = styled.button`
  font-size: 13px;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid var(--border);
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  &:hover {
    color: var(--text-primary);
    border-color: var(--steel);
  }
`;

const SignInBtn = styled(Btn)`
  border-color: var(--ember);
  color: var(--ember);
  &:hover {
    background: rgba(255,107,53,0.1);
    border-color: var(--ember);
    color: var(--ember);
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--ember-soft);
  border: 1px solid var(--ember);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--ember);
  cursor: default;
  flex-shrink: 0;
`;

export default function Header({ showReset, onReset, user, onSignIn, onSignOut, onDashboard }) {
  const initial = user?.email?.[0]?.toUpperCase() || user?.user_metadata?.full_name?.[0]?.toUpperCase() || "?";

  return (
    <Bar>
      <Brand>
        <Spark />
        <Wordmark>PersonaForge</Wordmark>
        <Tagline> || forge your identity</Tagline>
      </Brand>

      <Controls>
        {showReset && <Btn onClick={onReset}>Start over</Btn>}
        {user ? (
          <>
            <Btn onClick={onDashboard}>Dashboard</Btn>
            <Avatar title={user.email}>{initial}</Avatar>
            <Btn onClick={onSignOut}>Sign out</Btn>
          </>
        ) : (
          <SignInBtn onClick={onSignIn}>Sign in</SignInBtn>
        )}
      </Controls>
    </Bar>
  );
}