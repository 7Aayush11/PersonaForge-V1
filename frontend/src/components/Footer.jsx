import styled from "styled-components";

const Bar = styled.footer`padding:38px clamp(16px,3vw,32px) 20px;border-top:1px solid var(--border);background:#090c11;`;
const Inner = styled.div`width:min(1120px,100%);margin:0 auto;`;
const Top = styled.div`display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:32px;@media(max-width:760px){grid-template-columns:repeat(2,minmax(0,1fr));}@media(max-width:460px){gap:24px 16px;}`;
const Brand = styled.a`display:inline-flex;align-items:center;gap:10px;color:var(--text-primary);font-family:var(--font-display);font-weight:750;font-size:20px;text-decoration:none;letter-spacing:-.03em;`;
const BrandLogo = styled.img`width:34px;height:34px;object-fit:contain;display:block;flex-shrink:0;`;
const Description = styled.p`max-width:300px;margin:12px 0 0;color:var(--text-muted);font-size:12px;line-height:1.8;`;
const Column = styled.nav`display:flex;flex-direction:column;align-items:flex-start;gap:11px;`;
const Heading = styled.h3`margin:2px 0 5px;color:var(--text-primary);font-size:12px;`;
const FooterLink = styled.a`color:var(--text-muted);font-size:12px;text-decoration:none;transition:color .2s;&:hover{color:var(--ember);}`;
const Bottom = styled.div`margin-top:30px;padding-top:18px;border-top:1px solid var(--border);display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;`;
const Note = styled.p`margin:0;color:var(--text-muted);font:10px var(--font-mono);`;

export default function Footer({ onNavigate }) {
  const go = (event, path) => {
    event.preventDefault();
    if (onNavigate) onNavigate(path);
    else window.location.href = path;
  };
  const sectionLink = (event, id) => go(event, `/#${id}`);

  return <Bar><Inner>
    <Top>
      <div>
        <Brand href="/" onClick={e => go(e, "/")} aria-label="PersonaForge home">
          <BrandLogo src="/BackgroundLogo.png" alt="PersonaForge logo" onError={e => { e.currentTarget.style.display = "none"; }} />
          <span>PersonaForge</span>
        </Brand>
        <Description>Turn your resume into a personal portfolio website. Present your experience, projects, and story in one place.</Description>
      </div>
      <Column aria-label="Explore">
        <Heading>Explore</Heading>
        <FooterLink href="/" onClick={e => go(e, "/")}>Home</FooterLink>
        <FooterLink href="/#how-it-works" onClick={e => sectionLink(e, "how-it-works")}>How it Works</FooterLink>
        <FooterLink href="/#features" onClick={e => sectionLink(e, "features")}>Features</FooterLink>
        <FooterLink href="/#faq" onClick={e => sectionLink(e, "faq")}>FAQ</FooterLink>
        <FooterLink href="/about" onClick={e => go(e, "/about")}>About us</FooterLink>
        <FooterLink href="/pricing" onClick={e => go(e, "/pricing")}>Pricing</FooterLink>
      </Column>
      <Column aria-label="Policies">
        <Heading>Policies</Heading>
        <FooterLink href="/privacy" onClick={e => go(e, "/privacy")}>Privacy Policy</FooterLink>
        <FooterLink href="/terms" onClick={e => go(e, "/terms")}>Terms of Service</FooterLink>
        <FooterLink href="/cookies" onClick={e => go(e, "/cookies")}>Cookie Policy</FooterLink>
        <FooterLink href="/refund-policy" onClick={e => go(e, "/refund-policy")}>Refund Policy</FooterLink>
      </Column>
      <Column aria-label="Contact">
        <Heading>Contact</Heading>
        <FooterLink href="mailto:nisarayush1172004@gmail.com">Email us</FooterLink>
        <FooterLink href="https://github.com/7aayush11" target="_blank" rel="noopener noreferrer">GitHub ↗</FooterLink>
      </Column>
    </Top>
    <Bottom><Note>© {new Date().getFullYear()} PersonaForge</Note><Note>Built to help your work speak for itself.</Note></Bottom>
  </Inner></Bar>;
}
