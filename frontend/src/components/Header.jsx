import React from "react";
import styled from "styled-components";

// ─── Styled components ────────────────────────────────────────────────────────

const Nav = styled.header`
  position: sticky;
  top: env(safe-area-inset-top, 0px);
  z-index: 100;
  background: rgba(11, 14, 20, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const Logo = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
`;

const LogoMark = styled.span`
  width: 32px;
  height: 32px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  .brand-logo {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
`;


const LogoText = styled.span`
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 15px;
  font-weight: 700;
  color: #e6eef8;
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px;

  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }

  @media (max-width: 540px) {
    gap: 0;
    max-width: 48vw;
  }
`;

const NavLink = styled.button`
  background: none;
  border: none;
  color: #8b95a7;
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 7px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: #e6eef8;
    background: rgba(255, 255, 255, 0.06);
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProChip = styled.span`
  background: rgba(255, 107, 53, 0.18);
  color: #ff6b35;
  border: 1px solid rgba(255, 107, 53, 0.3);
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 99px;
`;

const UpgradeBtn = styled.button`
  background: rgba(255, 107, 53, 0.15);
  color: #ff6b35;
  border: 1px solid rgba(255, 107, 53, 0.25);
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    background: rgba(255, 107, 53, 0.25);
    border-color: rgba(255, 107, 53, 0.4);
  }
`;

const SignInBtn = styled.button`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e6eef8;
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 13px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const UserChip = styled.button`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e6eef8;
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 13px;
  padding: 5px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Avatar = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #ff6b35;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Header({
  user,
  onSignIn,
  onSignOut,
  onNavigate,
  entitlements,
  onUpgrade,
}) {
  const tier = entitlements?.tier;
  const isPremium = tier === "premium";
  const showUpgrade = tier === "free" || tier === "guest" || !tier;

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : user?.user_metadata?.full_name
    ? user.user_metadata.full_name.slice(0, 2).toUpperCase()
    : "U";

  return (
    <Nav>
      <Logo onClick={() => onNavigate && onNavigate("/")} aria-label="PersonaForge home">
      <LogoMark>
        <img
          src="/BackgroundLogo.png"
          alt="PersonaForge logo"
          className="brand-logo"
        />
      </LogoMark>
      <LogoText>PersonaForge</LogoText>
    </Logo>

      <NavLinks>
        <NavLink onClick={() => onNavigate && onNavigate("/#how-it-works")}>How it works</NavLink>
        <NavLink onClick={() => onNavigate && onNavigate("/#features")}>Features</NavLink>
        <NavLink onClick={() => onNavigate && onNavigate("/#faq")}>FAQ</NavLink>
        <NavLink onClick={() => onNavigate && onNavigate("/about")}>About</NavLink>
        <NavLink onClick={() => onNavigate && onNavigate("/pricing")}>Pricing</NavLink>
        {user && <NavLink onClick={() => onNavigate && onNavigate("/dashboard")}>Dashboard</NavLink>}
      </NavLinks>

      <Controls>
        {isPremium ? (
          <ProChip>PRO</ProChip>
        ) : showUpgrade && (
          <UpgradeBtn onClick={onUpgrade}>Upgrade</UpgradeBtn>
        )}

        {user ? (
          <UserChip onClick={onSignOut} title="Sign out">
            <Avatar>{initials}</Avatar>
            {user?.user_metadata?.full_name?.split(" ")[0] ||
              user?.email?.split("@")[0] ||
              "Account"}
          </UserChip>
        ) : (
          <SignInBtn onClick={onSignIn}>Sign in</SignInBtn>
        )}
      </Controls>
    </Nav>
  );
}