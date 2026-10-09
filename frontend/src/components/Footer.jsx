import styled from "styled-components";

const Bar = styled.footer`
  padding: 38px clamp(16px, 3vw, 32px) 20px;
  border-top: 1px solid var(--border);
  background: #090c11;
`;
const Inner = styled.div`width: min(1120px, 100%); margin: 0 auto;`;
const Top = styled.div`
  display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 32px;
  @media (max-width: 760px) { grid-template-columns: repeat(2,minmax(0,1fr)); }
  @media (max-width: 460px) { grid-template-columns: 1fr 1fr; gap: 24px 16px; }
`;
const Brand = styled.a`
  color: var(--text-primary); font-family: var(--font-display); font-weight: 750;
  font-size: 20px; text-decoration: none; letter-spacing: -.03em;
`;
const Description = styled.p`
  max-width: 300px; margin: 12px 0 0; color: var(--text-muted);
  font-size: 12px; line-height: 1.8;
`;
const Column = styled.nav`display:flex; flex-direction:column; align-items:flex-start; gap:11px;`;
const Heading = styled.h3`margin:2px 0 5px; color:var(--text-primary); font-size:12px;`;
const Link = styled.a`
  color:var(--text-muted); font-size:12px; text-decoration:none; transition:color .2s;
  &:hover { color:var(--ember); }
`;
const Bottom = styled.div`
  margin-top:30px; padding-top:18px; border-top:1px solid var(--border);
  display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap;
`;
const Note = styled.p`margin:0; color:var(--text-muted); font:10px var(--font-mono);`;

export default function Footer() {
  const smoothLink = (event, id) => {
    if (window.location.pathname !== "/") return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", id);
  };
  return <Bar><Inner>
    <Top>
      <div><Brand href="/">PersonaForge</Brand><Description>Turn your resume into a personal portfolio website. Present your experience, projects, and story in one place.</Description></div>
      <Column aria-label="Explore"><Heading>Explore</Heading>
        <Link href="/" onClick={(e) => { if (window.location.pathname !== "/") return; e.preventDefault(); window.scrollTo({top:0,behavior:"smooth"}); window.history.replaceState(null,"","/"); }}>Home</Link>
        <Link href="/#how-it-works" onClick={(e)=>smoothLink(e,"#how-it-works")}>How it Works</Link>
        <Link href="/#features" onClick={(e)=>smoothLink(e,"#features")}>Features</Link>
        <Link href="/#faq" onClick={(e)=>smoothLink(e,"#faq")}>FAQ</Link>
        <Link href="/about">About us</Link>
        <Link href="/pricing">Pricing</Link>
      </Column>
      <Column aria-label="Policies"><Heading>Policies</Heading>
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of Service</Link>
        <Link href="/cookies">Cookie Policy</Link>
      </Column>
      <Column aria-label="Contact"><Heading>Contact</Heading>
        <Link href="mailto:nisarayush1172004@gmail.com">Email us</Link>
        <Link href="https://github.com" target="_blank" rel="noreferrer">GitHub ↗</Link>
      </Column>
    </Top>
    <Bottom><Note>© {new Date().getFullYear()} PersonaForge</Note><Note>Built to help your work speak for itself.</Note></Bottom>
  </Inner></Bar>;
}
