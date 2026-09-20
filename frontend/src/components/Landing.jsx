import { useState } from "react";
import styled, { keyframes } from "styled-components";
import Upload from "./Upload";

const fadeUp = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;

const Wrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
`;

const HeroSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 72px 24px 56px;
  gap: 32px;
  animation: ${fadeUp} 0.5s ease;
`;

const Eyebrow = styled.span`
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ember);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: var(--ember-soft);
  padding: 4px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255,107,53,0.2);
`;

const Headline = styled.h1`
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(36px, 5.5vw, 58px);
  line-height: 1.08;
  letter-spacing: -0.03em;
  margin: 0;
  text-align: center;
  max-width: 720px;
`;

const Accent = styled.span`
  background: linear-gradient(90deg, var(--ember), var(--steel));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Sub = styled.p`
  font-size: 17px;
  color: var(--text-muted);
  line-height: 1.7;
  margin: 0;
  text-align: center;
  max-width: 560px;
`;

const StepsRail = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  max-width: 560px;
  width: 100%;
  &::before {
    content: "";
    position: absolute;
    top: 17px;
    left: 48px;
    right: 48px;
    height: 2px;
    background: linear-gradient(90deg, var(--ember), var(--steel));
    opacity: 0.3;
  }
`;

const SparkTravel = keyframes`
  0%, 10% { left: 48px; }
  45%, 55% { left: calc(50% - 5px); }
  90%, 100% { left: calc(100% - 58px); }
`;

const TravelSpark = styled.div`
  position: absolute;
  top: 13px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ember);
  box-shadow: 0 0 14px var(--ember);
  animation: ${SparkTravel} 4s ease-in-out infinite;
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 110px;
  z-index: 1;
`;

const Dot = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
`;

const StepLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
`;

const StepDetail = styled.span`
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.4;
`;

const PrivacyNote = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: 20px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: var(--border);
`;

const FeaturesSection = styled.div`
  width: 100%;
  max-width: 900px;
  padding: 56px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
`;

const SectionTitle = styled.h2`
  font-family: var(--font-display);
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 700;
  margin: 0;
  text-align: center;
  letter-spacing: -0.02em;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  width: 100%;
`;

const FeatureCard = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.2s ease;
  &:hover { border-color: var(--steel); }
`;

const FeatureIcon = styled.span`font-size: 22px;`;
const FeatureName = styled.h3`margin: 0; font-size: 14px; font-weight: 600; color: var(--text-primary);`;
const FeatureDesc = styled.p`margin: 0; font-size: 13px; color: var(--text-muted); line-height: 1.5;`;

const FAQSection = styled.div`
  width: 100%;
  max-width: 680px;
  padding: 0 24px 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
`;

const FAQList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FAQItem = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
`;

const FAQQuestion = styled.button`
  width: 100%;
  text-align: left;
  padding: 16px 18px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  &:hover { color: var(--steel); }
`;

const FAQArrow = styled.span`
  font-size: 12px;
  color: var(--text-muted);
  transition: transform 0.2s ease;
  transform: ${p => p.$open ? "rotate(180deg)" : "rotate(0deg)"};
  flex-shrink: 0;
`;

const FAQAnswer = styled.div`
  padding: ${p => p.$open ? "0 18px 16px" : "0 18px"};
  max-height: ${p => p.$open ? "400px" : "0"};
  overflow: hidden;
  transition: max-height 0.25s ease, padding 0.25s ease;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.7;
`;

const FooterSection = styled.footer`
  width: 100%;
  border-top: 1px solid var(--border);
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const FooterGrid = styled.div`
  width: 100%;
  max-width: 800px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
`;

const FooterCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FooterTitle = styled.h4`
  margin: 0;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
`;

const FooterLink = styled.a`
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s ease;
  &:hover { color: var(--steel); }
`;

const FEATURES = [
  { icon: "⚡", name: "Under 30 seconds", desc: "Upload a resume and get a complete, styled portfolio before you can make a coffee." },
  { icon: "🔒", name: "Privacy first", desc: "Your resume is deleted from our servers the moment your portfolio is generated. Nothing is stored." },
  { icon: "✏️", name: "Chat to edit", desc: "Describe what you want changed in plain English. No templates, no drag-and-drop." },
  { icon: "🚀", name: "One-click deploy", desc: "Get a live, shareable link instantly. No hosting setup, no DNS, no config files." },
  { icon: "⚛️", name: "Built with React", desc: "Real production-grade code: React, Tailwind, and Framer Motion — not a static HTML export." },
  { icon: "🌐", name: "Custom domains", desc: "Connect your own domain to your deployed portfolio from the dashboard." },
];

const FAQS = [
  { q: "Is PersonaForge free to use?", a: "Yes — generating, editing, and deploying your portfolio is completely free right now. We'll introduce optional paid features in the future, but the core experience will always have a free tier." },
  { q: "Do you store my resume?", a: "No. Your resume is processed in memory and deleted from our servers the moment your portfolio has been generated. We never store, read, or share your personal documents." },
  { q: "What file formats does it accept?", a: "PDF resumes and image-based resumes (JPG, PNG). Most resumes — whether exported from Word, Google Docs, or scanned — will work correctly." },
  { q: "Can I edit my portfolio after deploying?", a: "Yes. Sign in, open your portfolio from the dashboard, make changes through the chat editor, and redeploy. Your live link stays the same." },
  { q: "Does the generated code actually work as a real website?", a: "Yes. PersonaForge generates real React + Tailwind + Framer Motion code, not a static screenshot. You can download the source code, run it locally, and deploy it anywhere." },
  { q: "What happens if I don't like the output?", a: "Use the chat editor to describe exactly what you want changed — colors, layout, sections, content. If something's genuinely wrong, the self-healing system will attempt to fix it automatically." },
  { q: "Can I use a custom domain?", a: "Custom domain support is coming. For now, deployed portfolios get a personaforge link. Sign in and check your dashboard for updates." },
  { q: "Who built this?", a: "PersonaForge is built and maintained by Aayush Nisar. Reach out via the contact link below for anything from feedback to enterprise inquiries." },
];

function FAQRow({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <FAQItem>
      <FAQQuestion onClick={() => setOpen(o => !o)}>
        {q}
        <FAQArrow $open={open}>▼</FAQArrow>
      </FAQQuestion>
      <FAQAnswer $open={open}>{a}</FAQAnswer>
    </FAQItem>
  );
}

export default function Landing({ handleUpload }) {
  return (
    <Wrap>
      <HeroSection>
        <Eyebrow>Resume → Portfolio</Eyebrow>
        <Headline>
          Your resume, forged into a<br />
          <Accent>live portfolio.</Accent>
        </Headline>
        <Sub>
          Upload a PDF or photo of your resume. PersonaForge builds a real, React-powered personal website around it — then lets you refine it by describing what you want changed.
        </Sub>

        <StepsRail>
          <TravelSpark />
          <Step>
            <Dot>01</Dot>
            <StepLabel>Upload</StepLabel>
            <StepDetail>PDF or photo of your resume</StepDetail>
          </Step>
          <Step>
            <Dot>02</Dot>
            <StepLabel>Forge</StepLabel>
            <StepDetail>Describe changes in plain English</StepDetail>
          </Step>
          <Step>
            <Dot>03</Dot>
            <StepLabel>Deploy</StepLabel>
            <StepDetail>Get a live link to share</StepDetail>
          </Step>
        </StepsRail>

        <Upload handleUpload={handleUpload} />

        <PrivacyNote>
          <span>🔒</span>
          Your resume is deleted from our servers the moment your portfolio is generated.
        </PrivacyNote>
      </HeroSection>

      <Divider />

      <FeaturesSection>
        <SectionTitle>Everything you need, nothing you don't</SectionTitle>
        <FeatureGrid>
          {FEATURES.map(f => (
            <FeatureCard key={f.name}>
              <FeatureIcon>{f.icon}</FeatureIcon>
              <FeatureName>{f.name}</FeatureName>
              <FeatureDesc>{f.desc}</FeatureDesc>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </FeaturesSection>

      <Divider />

      <FAQSection>
        <SectionTitle>Frequently asked questions</SectionTitle>
        <FAQList>
          {FAQS.map(faq => <FAQRow key={faq.q} q={faq.q} a={faq.a} />)}
        </FAQList>
      </FAQSection>

      <FooterSection>
        <FooterGrid>
          <FooterCol>
            <FooterTitle>PersonaForge</FooterTitle>
            <FooterLink href="#" onClick={e => e.preventDefault()}>Home</FooterLink>
            <FooterLink href="#" onClick={e => e.preventDefault()}>Dashboard</FooterLink>
          </FooterCol>
          <FooterCol>
            <FooterTitle>Resources</FooterTitle>
            <FooterLink href="https://github.com/7Aayush11" target="_blank" rel="noopener noreferrer">GitHub</FooterLink>
            <FooterLink href="https://linkedin.com/in/aayush-nisar" target="_blank" rel="noopener noreferrer">LinkedIn</FooterLink>
          </FooterCol>
          <FooterCol>
            <FooterTitle>Contact</FooterTitle>
            <FooterLink href="mailto:nisarayush1172004@gmail.com">nisarayush1172004@gmail.com</FooterLink>
            <FooterLink href="https://github.com/7Aayush11/PersonaForge-V1" target="_blank" rel="noopener noreferrer">Open source on GitHub</FooterLink>
          </FooterCol>
        </FooterGrid>
      </FooterSection>
    </Wrap>
  );
}