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
      ["Who it is for", "Students, job seekers, professionals, and creators who want to present their work in one place."],
    ],
  },
  privacy: {
    eyebrow: "Legal / Privacy", title: "Privacy Policy",
    lead: "This policy explains how PersonaForge may collect, use, and handle information. Verify it against the actual application, storage, retention, and AI-provider practices before publishing.",
    cards: [["Information provided", "You may submit resumes, documents, images, account information, portfolio content, and instructions."], ["Use of information", "Information may be processed to generate, edit, display, save, and manage portfolios and to operate and secure the service."], ["Third parties and retention", "Identify the authentication, hosting, database, payment, and AI providers actually used, and explain data sharing and retention." ]],
  },
  terms: {
    eyebrow: "Legal / Terms", title: "Terms of Service",
    lead: "These terms describe general expectations for using PersonaForge. Review them against the actual product, checkout conditions, and applicable law before publication.",
    cards: [["Responsible use", "Use PersonaForge lawfully and do not interfere with service security, availability, or operation."], ["Your content", "Upload only content you own or have permission to use. Review generated content for accuracy and rights before publishing."], ["Paid features", "Clearly disclose applicable pricing, usage limits, subscriptions, renewals, cancellation, termination, and liability terms."]],
  },
  cookies: {
    eyebrow: "Legal / Cookies", title: "Cookie Policy",
    lead: "This policy describes potential use of cookies and browser storage. Confirm which technologies the live application actually uses before publishing.",
    cards: [["Essential technologies", "Authentication, session management, and security may require cookies or browser storage."], ["Optional tracking", "Disclose analytics, advertising, or other optional tracking providers and obtain consent where required."], ["Managing preferences", "Users can generally manage cookies in browser settings. Blocking essential technologies may affect sign-in or core functionality."]],
  },
  "refund-policy": {
    eyebrow: "Legal / Billing", title: "Refund Policy",
    lead: "This policy explains how payment, cancellation, and refund requests are handled. Ensure it matches your checkout terms and applicable consumer law.",
    cards: [["Digital services and subscriptions", "Payments may generally be non-refundable after a paid feature or subscription is activated, except where a refund is required by law or this policy provides otherwise."], ["Failed payments or duplicate charges", "If a payment was debited but the purchase was not activated, or the same purchase was charged more than once, contact support with transaction details for verification and correction."], ["Technical issues", "If a paid feature fails because of a verified technical issue that cannot be resolved within a reasonable time, contact support for review of the affected purchase."]],
  },
  notFound: {
    eyebrow: "404 / Not found", title: "This page doesn't exist.",
    lead: "The page may have moved, or the address may be incorrect.",
    cards: [["Go back", "Return to the PersonaForge home page to explore the available features."]],
  },
};

export default function StaticPage({ type, onNavigate }) {
  const page = content[type] || content.notFound;
  const isPolicyPage = ["privacy", "terms", "cookies", "refund-policy"].includes(type);
  const goHome = () => onNavigate ? onNavigate("/") : (window.location.href = "/");

  return (
    <Page>
      <Eyebrow>{page.eyebrow}</Eyebrow>
      <Title>{page.title}</Title>
      <Lead>{page.lead}</Lead>
      <Grid>{page.cards.map(([title, description]) => <Card key={title}><h2>{title}</h2><p>{description}</p></Card>)}</Grid>
      <CTA onClick={goHome}>Back to PersonaForge</CTA>
      {isPolicyPage && <Policy>
        {type === "privacy" && <>
          <section><h2>Information We Collect</h2><p>PersonaForge may process account details, resumes, documents, images, portfolio content, and instructions you submit. The exact information collected depends on the features you use.</p></section>
          <section><h2>How We Use Your Information</h2><p>Information may be used to authenticate users, generate and edit portfolios, save work, provide support, process subscriptions, maintain security, and improve service reliability.</p></section>
          <section><h2>Third-Party Services and Retention</h2><p>Identify the providers actually used for authentication, hosting, database storage, payments, and AI processing. Explain relevant sharing, retention periods, and how deletion requests are handled.</p></section>
          <section><h2>Your Choices and Contact</h2><p>For privacy questions or requests concerning your data, contact nisarayush1172004@gmail.com. Add applicable access, correction, deletion, and complaint procedures before publication.</p></section>
        </>}
        {type === "terms" && <>
          <section><h2>Using PersonaForge</h2><p>Use PersonaForge lawfully and upload only information you are authorized to use. You are responsible for reviewing generated content and ensuring published material does not violate others' rights.</p></section>
          <section><h2>Accounts and Generated Content</h2><p>You are responsible for account security and activity performed through your account. AI-generated content may contain errors or omissions, so verify important details before publishing.</p></section>
          <section><h2>Availability and Paid Features</h2><p>Features, usage limits, pricing, and availability may change. Subscription, renewal, cancellation, and payment conditions should be clearly disclosed at checkout and comply with applicable law.</p></section>
          <section><h2>Suspension and Termination</h2><p>Final terms should explain account suspension and termination, account closure, and what happens to saved portfolios and other information after closure.</p></section>
          <section><h2>Liability and Contact</h2><p>For questions, contact nisarayush1172004@gmail.com. Add appropriate provisions for warranties, liability, dispute resolution, and governing law before publication.</p></section>
        </>}
        {type === "cookies" && <>
          <section><h2>Essential Cookies and Storage</h2><p>PersonaForge may use cookies or browser storage for authentication, session management, security, and core functionality. Confirm the exact technologies used by your application.</p></section>
          <section><h2>Analytics and Optional Technologies</h2><p>If analytics, advertising, or optional tracking tools are enabled, disclose their providers, purposes, and retention practices. Obtain consent where required by law.</p></section>
          <section><h2>Managing Cookies</h2><p>You can manage or delete cookies through browser settings. Blocking essential cookies or storage may affect sign-in and some features.</p></section>
          <section><h2>Changes and Contact</h2><p>Update this policy when your technologies change. For questions, contact nisarayush1172004@gmail.com.</p></section>
        </>}
        {type === "refund-policy" && <>
          <section><h2>Subscription Cancellation</h2><p>You may cancel a subscription to prevent future renewals. Cancellation does not automatically refund the current billing period. Access may continue until the end of the period already paid for, unless checkout terms or applicable law provide otherwise.</p></section>
          <section><h2>How to Request a Refund</h2><p>Email nisarayush1172004@gmail.com from your account email and include your payment reference or order ID, date and amount charged, and a short explanation. Do not email full card numbers, passwords, or other sensitive payment credentials.</p></section>
          <section><h2>Review and Processing</h2><p>Requests will be reviewed individually. Approved refunds will generally be returned through the original payment method, subject to payment-provider processing times.</p></section>
          <section><h2>Legal Rights and Policy Changes</h2><p>This policy does not limit consumer rights that cannot be excluded under applicable law. Add an effective date and ensure this wording matches the actual checkout and payment flows.</p></section>
          <section><h2>Contact</h2><p>For payment or refund questions, email nisarayush1172004@gmail.com.</p></section>
        </>}
        <p>Last updated: add the effective date before publication. This template should be checked against actual product operations and applicable law.</p>
      </Policy>}
    </Page>
  );
}
