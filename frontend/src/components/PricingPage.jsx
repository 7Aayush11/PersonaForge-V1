import styled from "styled-components";

const Page = styled.main`
  max-width: 1000px;
  margin: 0 auto;
  padding: 60px 24px 100px;
  @media (max-width: 600px) { padding: 44px 16px 70px; }
`;
const Title = styled.h1`
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: clamp(32px, 5vw, 44px);
  font-weight: 800;
  color: var(--text-primary, #e6eef8);
  margin: 0 0 12px;
  letter-spacing: -.045em;
`;
const Subtitle = styled.p`
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 15px;
  color: var(--text-muted, #8b95a7);
  margin: 0 0 48px;
  line-height: 1.8;
`;
const Plans = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 36px;
  @media (max-width: 820px) { grid-template-columns: 1fr; }
`;
const Card = styled.article`
  background: var(--surface, #141a24);
  border: 1.5px solid ${p => p.$featured ? "var(--ember, #ff6b35)" : "var(--border, rgba(255,255,255,.08))"};
  border-radius: 14px;
  padding: 28px 24px;
  position: relative;
`;
const Badge = styled.span`
  position: absolute; top: -12px; left: 24px;
  background: var(--ember, #ff6b35); color: #fff;
  font-family: var(--font-mono, monospace); font-size: 9px;
  letter-spacing: .1em; text-transform: uppercase;
  padding: 4px 10px; border-radius: 99px;
`;
const Tier = styled.p`
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 15px; font-weight: 700; color: var(--text-primary, #e6eef8);
  margin: 0 0 6px;
`;
const Amount = styled.p`
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 32px; font-weight: 800;
  color: ${p => p.$featured ? "var(--ember, #ff6b35)" : "var(--text-primary, #e6eef8)"};
  margin: 0 0 4px;
  span { font-size: 13px; font-weight: 400; color: var(--text-muted, #8b95a7); }
`;
const Description = styled.p`
  font-size: 13px; color: var(--text-muted, #8b95a7); margin: 0 0 22px; line-height: 1.7;
`;
const Features = styled.ul`
  list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;
`;
const Feature = styled.li`
  font-size: 12px; line-height: 1.6;
  color: ${p => p.$off ? "#596273" : "var(--text-muted, #8b95a7)"};
  display: flex; align-items: flex-start; gap: 8px;
  &::before { content: "${p => p.$off ? "✕" : "✓"}"; color: ${p => p.$off ? "#596273" : "#1abc9c"}; font-weight: 700; }
`;
const UpgradeButton = styled.button`
  display: block; width: min(100%, 300px); margin: 0 auto;
  padding: 14px 24px; border: 0; border-radius: 11px;
  background: var(--ember, #ff6b35); color: white;
  font: 700 14px var(--font-display, "Space Grotesk", sans-serif);
  cursor: pointer; transition: transform .15s, opacity .15s;
  &:hover { opacity: .92; transform: translateY(-1px); }
  &:focus-visible { outline: 2px solid var(--text-primary); outline-offset: 3px; }
`;
const FinePrint = styled.p`
  margin: 14px auto 0; max-width: 520px; text-align: center;
  color: var(--text-muted, #8b95a7); font-size: 11px; line-height: 1.7;
`;

export default function PricingPage({ onUpgrade }) {
  return (
    <Page>
      <Title>Simple, transparent pricing.</Title>
      <Subtitle>Start free. Upgrade when you need more tools and flexibility.</Subtitle>
      <Plans>
        <Card>
          <Tier>Free</Tier>
          <Amount>₹0<span> / forever</span></Amount>
          <Description>For trying PersonaForge and publishing your first portfolio.</Description>
          <Features>
            <Feature>1 portfolio generation</Feature>
            <Feature>3 edits per week for signed-in users</Feature>
            <Feature>Save your portfolio</Feature>
            <Feature>Free deployment for signed-in users</Feature>
            <Feature $off>Portfolio download</Feature>
            <Feature $off>Premium AI model access</Feature>
          </Features>
        </Card>
        <Card $featured>
          <Badge>Popular</Badge>
          <Tier>Premium — 3 months</Tier>
          <Amount $featured>₹249<span> / 3 months</span></Amount>
          <Description>More room to create and refine your portfolio.</Description>
          <Features>
            <Feature>Unlimited generation and editing, subject to fair-use rules</Feature>
            <Feature>Save your portfolio</Feature>
            <Feature>Deployment</Feature>
            <Feature>Premium AI model access</Feature>
            <Feature>AI-assisted editing</Feature>
            <Feature>Portfolio download</Feature>
          </Features>
        </Card>
        <Card>
          <Badge>Monthly</Badge>
          <Tier>Premium — 1 month</Tier>
          <Amount>₹99<span> / month</span></Amount>
          <Description>Flexible monthly access to premium features.</Description>
          <Features>
            <Feature>Unlimited generation and editing, subject to fair-use rules</Feature>
            <Feature>Save your portfolio</Feature>
            <Feature>Deployment</Feature>
            <Feature>Premium AI model access</Feature>
            <Feature>AI-assisted editing</Feature>
            <Feature>Portfolio download</Feature>
          </Features>
        </Card>
      </Plans>
      <UpgradeButton onClick={onUpgrade}>Get Premium</UpgradeButton>
      <FinePrint>Feature availability and billing terms shown at checkout apply. Review your portfolio before publishing.</FinePrint>
    </Page>
  );
}
