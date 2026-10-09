import styled from "styled-components";

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  padding: 14px clamp(16px, 3vw, 32px);
  background: rgba(11, 14, 20, 0.92);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--border);
  @media (max-width: 900px) { flex-wrap: wrap; }
`;

const Brand = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
`;
const Spark = styled.span`
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--ember); box-shadow: 0 0 10px var(--ember);
`;
const Wordmark = styled.span`
  color: var(--text-primary); font-family: var(--font-display);
  font-weight: 750; font-size: 19px; letter-spacing: -.03em;
`;
const Tagline = styled.span`
  color: var(--text-muted); font-family: var(--font-mono); font-size: 10px;
  @media (max-width: 650px) { display: none; }
`;
const Navigation = styled.nav`
  display: flex; justify-content: center; align-items: center; gap: 4px;
  flex: 1;
  @media (max-width: 900px) { order: 3; flex-basis: 100%; overflow-x: auto; justify-content: flex-start; }
`;
const NavLink = styled.a`
  padding: 9px 11px; border-radius: 8px; white-space: nowrap;
  color: ${(p) => p.$active ? "var(--text-primary)" : "var(--text-muted)"};
  background: ${(p) => p.$active ? "var(--surface)" : "transparent"};
  border: 1px solid ${(p) => p.$active ? "var(--border)" : "transparent"};
  text-decoration: none; font-size: 12px; transition: .2s ease;
  &:hover { color: var(--text-primary); background: var(--surface); }
`;
const Controls = styled.div`
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
`;
const Btn = styled.button`
  font-size: 12px; color: var(--text-muted); background: transparent;
  border: 1px solid var(--border); padding: 8px 12px; border-radius: 999px;
  cursor: pointer; white-space: nowrap;
  &:hover { color: var(--text-primary); border-color: var(--steel); }
`;
const SignInBtn = styled(Btn)`
  color: var(--ember); border-color: var(--ember);
  &:hover { background: rgba(255,107,53,.1); color: var(--ember); }
`;
const Avatar = styled.div`
  width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center;
  color: var(--ember); background: var(--ember-soft); border: 1px solid var(--ember);
  font-family: var(--font-mono); font-size: 11px; flex-shrink: 0;
`;
const links = [
  { label: "How it Works", href: "#how-it-works", section: true },
  { label: "Features", href: "#features", section: true },
  { label: "FAQ", href: "#faq", section: true },
  { label: "About us", href: "/about", section: false },
  { label: "Pricing", href: "/pricing", section: false },
];

export default function Header({ showReset, onReset, user, onSignIn, onSignOut, onDashboard, currentPath = "/" }) {
  const initial = user?.email?.[0]?.toUpperCase() || user?.user_metadata?.full_name?.[0]?.toUpperCase() || "?";
  const onNavClick = (event, link) => {
    if (!link.section) return;
    if (currentPath !== "/") {
      event.preventDefault();
      window.location.href = `/${link.href}`;
      return;
    }
    const target = document.querySelector(link.href);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", link.href);
    }
  };

  return (
    <Bar>
      <Brand href="/" aria-label="PersonaForge home">
        <Spark /><Wordmark>PersonaForge</Wordmark><Tagline>forge your identity</Tagline>
      </Brand>
      <Navigation aria-label="Main navigation">
        {links.map((link) => (
          <NavLink key={link.href} href={link.href} onClick={(event) => onNavClick(event, link)} $active={link.section && currentPath === "/" && typeof window !== "undefined" && window.location.hash === link.href}>
            {link.label}
          </NavLink>
        ))}
      </Navigation>
      <Controls>
        {showReset && <Btn onClick={onReset}>Start over</Btn>}
        {user ? <>
          <Btn onClick={onDashboard}>Dashboard</Btn>
          <Avatar title={user.email}>{initial}</Avatar>
          <Btn onClick={onSignOut}>Sign out</Btn>
        </> : <SignInBtn onClick={onSignIn}>Sign in</SignInBtn>}
      </Controls>
    </Bar>
  );
}
