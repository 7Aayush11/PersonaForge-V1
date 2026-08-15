import styled from 'styled-components';
import Upload from './Upload';

const Wrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 24px 40px;
  gap: 48px;
  overflow-y: auto;
`;

const Hero = styled.div`
  max-width: 640px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Eyebrow = styled.span`
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ember);
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Headline = styled.h1`
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(32px, 5vw, 48px);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0;
`;

const Sub = styled.p`
  font-size: 16px;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
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
    left: 40px;
    right: 40px;
    height: 2px;
    background: linear-gradient(90deg, var(--ember), var(--steel));
    opacity: 0.35;
  }
`;

const Spark = styled.div`
  position: absolute;
  top: 13px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ember);
  box-shadow: 0 0 12px var(--ember);
  animation: travel 4s ease-in-out infinite;

  @keyframes travel {
    0%, 10% { left: 40px; }
    45%, 55% { left: calc(50% - 5px); }
    90%, 100% { left: calc(100% - 50px); }
  }
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100px;
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
`;

const StepLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
`;

const StepDetail = styled.span`
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
`;

const PrivacyNote = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 10px 16px;
  border-radius: 20px;
`;

export default function Landing({ handleUpload }) {
  return (
    <Wrap>
      <Hero>
        <Eyebrow>Resume &rarr; Portfolio</Eyebrow>
        <Headline>Your resume, forged into a live portfolio.</Headline>
        <Sub>
          Upload a PDF or photo of your resume. PersonaForge reads it, builds a real
          website around it, and lets you refine it by describing what you want changed
          &mdash; no templates to pick, no account to create.
        </Sub>
      </Hero>

      <StepsRail>
        <Spark />
        <Step>
          <Dot>01</Dot>
          <StepLabel>Upload</StepLabel>
          <StepDetail>PDF or photo of your resume</StepDetail>
        </Step>
        <Step>
          <Dot>02</Dot>
          <StepLabel>Forge</StepLabel>
          <StepDetail>Describe changes in plain english</StepDetail>
        </Step>
        <Step>
          <Dot>03</Dot>
          <StepLabel>Deploy</StepLabel>
          <StepDetail>Get a live link to share</StepDetail>
        </Step>
      </StepsRail>

      <Upload handleUpload={handleUpload} />

      <PrivacyNote>
        <span>&#128274;</span>
        Your resume is processed in memory and deleted the moment your portfolio is generated.
      </PrivacyNote>
    </Wrap>
  );
}