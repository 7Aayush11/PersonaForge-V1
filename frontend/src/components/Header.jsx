import { useState } from "react";
import styled from "styled-components";

const Bar = styled.header`
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  padding: 13px clamp(16px, 3vw, 32px);
  background: rgba(11, 14, 20, 0.88); backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
`;
const Brand = styled.a`
  display: flex; align-items: center; gap: 10px; flex-shrink: 0;
  color: var(--text-primary); text-decoration: none;
  font-family: var(--font-display); font-weight: 750; font-size: 19px; letter-spacing: -.03em;
`;
const Logo = styled.img`width: 32px; height: 32px; object-fit: contain;`;
const Nav = styled.nav`
  display: flex; align-items: center; justify-content: center; gap: clamp(12px, 2vw, 24px);
  @media (max-width: 900px) { display: none; }
`;
const NavLink = styled.a`
  color: var(--text-muted); text-decoration: none; font-size: 12px; white-space: nowrap;
  transition: color .2s; &:hover { color: var(--ember); }
`;
const Controls = styled.div`display:flex;align-items:center;gap:8px;`;
const Btn = styled.button`
  font-size: 12px; color: var(--text-muted); background: transparent;
  border: 1px solid var(--border); padding: 7px 12px; border-radius: 20px;
  cursor: pointer; transition: all .2s; white-space: nowrap;
  &:hover { color: var(--text-primary); border-color: var(--steel, var(--ember)); }
`;
const SignInBtn = styled(Btn)`border-color:var(--ember);color:var(--ember);&:hover{background:rgba(255,107,53,.1);}`;
const Avatar = styled.div`
  width: 31px; height: 31px; border-radius: 50%; background: var(--ember-soft, rgba(255,107,53,.12));
  border: 1px solid var(--ember); display:flex;align-items:center;justify-content:center;
  font: 600 12px var(--font-mono); color:var(--ember); flex-shrink:0;
`;
const MenuButton = styled(Btn)`display:none;padding:7px 10px;font-size:17px;@media(max-width:900px){display:inline-flex;}`;
const MobileMenu = styled.nav`
  display:none;
  @media(max-width:900px){display:${p => p.$open ? "flex" : "none"};position:absolute;top:100%;left:0;right:0;padding:16px 20px 20px;background:#0d1119;border-bottom:1px solid var(--border);flex-direction:column;align-items:stretch;gap:0;}
`;
const MobileLink = styled.a`
  padding:12px 2px;color:var(--text-muted);text-decoration:none;font-size:13px;border-bottom:1px solid var(--border);
  &:hover{color:var(--ember);}
`;

const links = [
  ["How it Works", "/#how-it-works"],
  ["Features", "/#features"],
  ["FAQ", "/#faq"],
  ["About us", "/about"],
  ["Pricing", "/pricing"],
];

export default function Header({ user, onSignIn, onSignOut, onDashboard, onNavigate, showReset, onReset }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initial = user?.email?.[0]?.toUpperCase() || user?.user_metadata?.full_name?.[0]?.toUpperCase() || "?";
  const go = (event, path) => {
    event.preventDefault();
    setMenuOpen(false);
    if (onNavigate) onNavigate(path);
    else window.location.href = path;
  };

  return (
    <Bar>
      <Brand href="/" onClick={e => go(e, "/")} aria-label="PersonaForge home">
        <Logo src="/BackgroundLogo.png" alt="" onError={e => { e.currentTarget.style.display = "none"; }} />
        <span>PersonaForge</span>
      </Brand>
      <Nav aria-label="Main navigation">
        {links.map(([label, path]) => <NavLink key={path} href={path} onClick={e => go(e, path)}>{label}</NavLink>)}
      </Nav>
      <Controls>
        {showReset && <Btn onClick={onReset}>Start over</Btn>}
        {user ? <>
          <Btn onClick={() => onDashboard ? onDashboard() : onNavigate?.("/dashboard")}>Dashboard</Btn>
          <Avatar title={user.email || "Signed in"}>{initial}</Avatar>
          <Btn onClick={onSignOut}>Sign out</Btn>
        </> : <SignInBtn onClick={onSignIn}>Sign in</SignInBtn>}
        <MenuButton aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? "×" : "☰"}</MenuButton>
      </Controls>
      <MobileMenu $open={menuOpen} aria-label="Mobile navigation">
        {links.map(([label, path]) => <MobileLink key={path} href={path} onClick={e => go(e, path)}>{label}</MobileLink>)}
      </MobileMenu>
    </Bar>
  );
}
