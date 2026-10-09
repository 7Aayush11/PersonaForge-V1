import styled from "styled-components";

const Page = styled.main`
  width: min(1000px, calc(100% - 40px));
  margin: 0 auto;
  padding: 76px 0 90px;
  flex: 1;
  @media (max-width: 600px) { padding: 48px 0 64px; width: calc(100% - 32px); }
`;
const Eyebrow = styled.p`
  margin: 0 0 14px; color: var(--ember); font: 11px var(--font-mono);
  letter-spacing: .12em; text-transform: uppercase;
`;
const Title = styled.h1`
  max-width: 780px; margin: 0; color: var(--text-primary);
  font-family: var(--font-display); font-size: clamp(36px,6vw,64px);
  letter-spacing: -.055em; line-height: 1.08;
`;
const Lead = styled.p`
  max-width: 700px; margin: 22px 0 0; color: var(--text-muted);
  font-size: 15px; line-height: 1.9;
`;
const Grid = styled.div`
  display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 15px; margin-top: 40px;
  @media(max-width:700px){grid-template-columns:1fr;}
`;
const Card = styled.article`
  padding: 23px; border: 1px solid var(--border); border-radius: 14px; background: var(--surface);
  h2 { margin: 0 0 10px; color: var(--text-primary); font-size: 16px; }
  p { margin: 0; color: var(--text-muted); font-size: 13px; line-height: 1.8; }
`;
const CTA = styled.button`
  margin-top: 30px; padding: 12px 18px; border: 1px solid var(--ember); border-radius: 10px;
  background: var(--ember); color: #fff; font-weight: 650; cursor: pointer;
`;
const Policy = styled.div`
  max-width: 780px; margin-top: 36px;
  section { margin-top: 28px; }
  h2 { color: var(--text-primary); font-size: 17px; }
  p { color: var(--text-muted); font-size: 13px; line-height: 1.9; }
`;
const content = {
  about: {
    eyebrow: "About PersonaForge",
    title: "Your work deserves a place of its own.",
    lead: "PersonaForge helps turn the professional information you already have into a personal portfolio website. Instead of starting from a blank page, you can begin with your resume, generate a first draft, and refine the result.",
    cards: [
      ["Our purpose", "Make it easier to create a professional online presence without needing to build a website from scratch."],
      ["How we approach it", "Use AI to help with the first draft while keeping review and refinement part of the workflow."],
      ["Who it is for", "Students, job seekers, professionals, and creators who want to present their work in one place."]
    ]
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Pricing is coming soon.",
    lead: "PersonaForge is still shaping its plans. Confirmed pricing, usage limits, and paid features will be published here when available.",
    cards: [
      ["Current experience", "Explore the portfolio generation flow and the features currently available in the application."],
      ["Future plans", "Paid plans and additional capabilities are being evaluated. No paid tier is advertised here yet."],
      ["No surprises", "Check this page for official plan details before making a purchasing decision."]
    ]
  },
  privacy: {
    eyebrow: "Legal / Privacy",
    title: "Privacy Policy",
    lead: "This is a draft overview. Before publication, ensure it accurately reflects the service's actual storage, retention, AI providers, and data handling practices.",
    cards: [
      ["Information provided", "You may submit resumes, documents, images, account information, and portfolio instructions."],
      ["Use of information", "Information may be processed to generate, edit, display, save, and manage portfolios and to operate and secure the service."],
      ["Third parties and retention", "Document the actual authentication, hosting, storage, and AI providers used, along with retention periods and a working privacy contact."]
    ]
  },
  terms: {
    eyebrow: "Legal / Terms",
    title: "Terms of Service",
    lead: "This is a draft and should be reviewed for the actual product and applicable jurisdiction before being treated as binding terms.",
    cards: [
      ["Responsible use", "Use PersonaForge lawfully and do not interfere with service security, availability, or operation."],
      ["Your content", "Upload only content you own or have permission to use. Review generated content for accuracy and rights before publishing."],
      ["Limitations", "Final terms should define account rules, availability, paid features, termination, warranties, liability, dispute handling, and governing law."]
    ]
  },
  cookies: {
    eyebrow: "Legal / Cookies",
    title: "Cookie Policy",
    lead: "Confirm the cookies and storage technologies actually used by the application before publishing this policy.",
    cards: [
      ["Essential technologies", "Authentication and security may require session technologies or browser storage."],
      ["Optional tracking", "Disclose analytics or advertising tools if enabled, including their providers, purposes, and any required consent."],
      ["Managing preferences", "Users can generally manage cookies in browser settings. Blocking essential technologies may affect sign-in or core functionality."]
    ]
  },
  notFound: {
    eyebrow: "404 / Not found",
    title: "This page doesn't exist.",
    lead: "The page may have moved, or the address may be incorrect.",
    cards: [["Go back", "Return to the PersonaForge home page to explore the available features."]]
  }
};

export function StaticPage({ type, onNavigate }) {
  const page = content[type] || content.notFound;
  return (
    <Page>
      <Eyebrow>{page.eyebrow}</Eyebrow>
      <Title>{page.title}</Title>
      <Lead>{page.lead}</Lead>
      <Grid>
        {page.cards.map(([title, description]) => <Card key={title}><h2>{title}</h2><p>{description}</p></Card>)}
      </Grid>
      <CTA onClick={() => onNavigate("/")}>Back to PersonaForge</CTA>
      {type !== "about" && type !== "pricing" && type !== "notFound" && (
        <Policy>
          <section><h2>Updates and contact</h2><p>Update this draft with the effective date, verified operational details, and the contact process before publishing it as a legal policy.</p></section>
        </Policy>
      )}
    </Page>
  );
}
