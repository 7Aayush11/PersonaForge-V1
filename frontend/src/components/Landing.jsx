import { useRef, useState } from "react";
import styled from "styled-components";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, FileText, Globe, LayoutTemplate, MessageSquareText, ShieldCheck, Sparkles, UploadCloud, WandSparkles, Zap } from "lucide-react";

const Page = styled.main`
  width:100%; overflow:hidden; background:radial-gradient(ellipse at 55% 0%,rgba(255,107,53,.07),transparent 42%),var(--background,#0b0e14);
  scroll-behavior:smooth;
`;
const Container = styled.div`width:min(1120px,calc(100% - 48px));margin:0 auto;@media(max-width:640px){width:calc(100% - 32px);}`;
const Hero = styled.section`
  padding:76px 0 78px; min-height:calc(100vh - 72px); display:flex; align-items:center;
  @media(max-width:700px){padding:54px 0 52px;min-height:0;}
`;
const HeroGrid = styled.div`display:grid;grid-template-columns:minmax(0,1.02fr) minmax(0,.98fr);align-items:center;gap:52px;
  @media(max-width:850px){grid-template-columns:1fr;gap:36px;}
`;
const Badge = styled.div`display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid rgba(255,107,53,.25);border-radius:99px;background:rgba(255,107,53,.07);color:var(--ember);font:10px var(--font-mono);letter-spacing:.09em;text-transform:uppercase;`;
const Heading = styled.h1`margin:25px 0 0;color:var(--text-primary);font-family:var(--font-display);font-size:clamp(42px,6vw,72px);font-weight:760;letter-spacing:-.065em;line-height:1.04;span{background:linear-gradient(100deg,#ff6b35,#d88ba2 55%,#64a9ff);background-clip:text;-webkit-background-clip:text;color:transparent;}`;
const Lead = styled.p`max-width:590px;margin:22px 0 0;color:var(--text-muted);font-size:15px;line-height:1.9;`;
const Actions = styled.div`display:flex;flex-wrap:wrap;gap:11px;margin-top:27px;`;
const Primary = styled.button`display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:46px;padding:0 18px;border:1px solid var(--ember);border-radius:10px;background:linear-gradient(110deg,#ff6b35,#d95748);color:#fff;font-size:13px;font-weight:700;cursor:pointer;transition:transform .2s,box-shadow .2s;&:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(255,107,53,.2);}`;
const Secondary = styled.a`display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 17px;border:1px solid var(--border);border-radius:10px;color:var(--text-primary);font-size:13px;text-decoration:none;&:hover{background:var(--surface);}`;
const FinePrint = styled.p`display:flex;align-items:center;gap:8px;margin:17px 0 0;color:var(--text-muted);font:10px var(--font-mono);line-height:1.8;`;
const DemoFrame = styled.div`padding:8px;border:1px solid #303746;border-radius:17px;background:linear-gradient(145deg,#171d28,#0f1219);box-shadow:0 32px 90px rgba(0,0,0,.35);`;
const DemoBar = styled.div`display:flex;align-items:center;justify-content:space-between;padding:10px 12px;`;
const Dots = styled.div`display:flex;gap:6px;span{width:7px;height:7px;border-radius:50%;background:#465062;}span:first-child{background:#ff765d;}span:nth-child(2){background:#e8bd61;}span:nth-child(3){background:#6cbe8b;}`;
const Mono = styled.span`color:#8290a5;font:9px var(--font-mono);`;
const DemoPage = styled.div`overflow:hidden;border:1px solid #29313e;border-radius:10px;background:#0d1119;`;
const DemoNav = styled.div`display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid #252c38;color:#e7edf7;font-size:10px;font-weight:700;`;
const DemoLinks = styled.div`display:flex;gap:12px;color:#8492a8;font-size:8px;font-weight:400;`;
const DemoHero = styled.div`display:grid;grid-template-columns:1.1fr .7fr;align-items:center;gap:12px;padding:24px 18px;background:radial-gradient(circle at 100% 0%,rgba(86,135,207,.15),transparent 50%),#101722;`;
const DemoCopy = styled.div`span{color:#ff936d;font:8px var(--font-mono);text-transform:uppercase;}h3{margin:8px 0;color:#edf2fa;font-size:clamp(17px,2vw,25px);letter-spacing:-.04em;line-height:1.1;}p{margin:0;color:#8e9db3;font-size:9px;line-height:1.7;}`;
const DemoAvatar = styled.div`aspect-ratio:4/5;display:grid;place-items:center;border:1px solid #3b475a;border-radius:12px;background:linear-gradient(145deg,#27354a,#151c28);color:#ff9876;svg{width:28px;height:28px;}`;
const DemoSection = styled.div`padding:15px 18px 18px;strong{display:block;margin-bottom:10px;color:#e7edf7;font-size:10px;}`;
const DemoCards = styled.div`display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;`;
const DemoCard = styled.div`padding:12px;border:1px solid #29313e;border-radius:8px;background:#111722;svg{color:#ff936d;width:14px;height:14px;}b{display:block;margin-top:8px;color:#e7edf7;font-size:9px;}p{margin:5px 0 0;color:#8290a5;font-size:8px;line-height:1.6;}`;
const Section = styled.section`padding:82px 0;scroll-margin-top:90px;@media(max-width:640px){padding:58px 0;}`;
const SectionHead = styled.div`max-width:680px;margin:0 auto 36px;text-align:center;span{color:var(--ember);font:10px var(--font-mono);letter-spacing:.12em;text-transform:uppercase;}h2{margin:14px 0 0;color:var(--text-primary);font-family:var(--font-display);font-size:clamp(30px,4.5vw,45px);letter-spacing:-.05em;line-height:1.12;}p{margin:14px 0 0;color:var(--text-muted);font-size:13px;line-height:1.9;}`;
const ThreeGrid = styled.div`display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;@media(max-width:760px){grid-template-columns:1fr;}`;
const Card = styled.article`padding:23px;border:1px solid var(--border);border-radius:14px;background:rgba(255,255,255,.015);transition:border-color .2s,transform .2s;&:hover{border-color:rgba(255,107,53,.4);transform:translateY(-2px);}h3{margin:0;color:var(--text-primary);font-size:15px;}p{margin:10px 0 0;color:var(--text-muted);font-size:12px;line-height:1.85;} .icon{display:grid;place-items:center;width:39px;height:39px;margin-bottom:18px;border:1px solid rgba(255,107,53,.18);border-radius:10px;background:rgba(255,107,53,.07);color:var(--ember);}`;
const Step = styled.div`display:flex;gap:15px;align-items:flex-start;.num{display:grid;place-items:center;width:35px;height:35px;flex-shrink:0;border:1px solid rgba(255,107,53,.25);border-radius:10px;color:var(--ember);font:11px var(--font-mono);background:rgba(255,107,53,.06);}h3{margin:2px 0 0;color:var(--text-primary);font-size:15px;}p{margin:7px 0 0;color:var(--text-muted);font-size:12px;line-height:1.8;}`;
const FAQ = styled.div`max-width:760px;margin:0 auto;border-top:1px solid var(--border);`;
const FAQItem = styled.details`padding:18px 0;border-bottom:1px solid var(--border);summary{display:flex;justify-content:space-between;align-items:center;gap:15px;color:var(--text-primary);font-size:13px;font-weight:650;cursor:pointer;list-style:none;}summary::-webkit-details-marker{display:none;}summary svg{color:var(--text-muted);transition:transform .2s;} &[open] summary svg{transform:rotate(180deg);}p{margin:12px 0 0;color:var(--text-muted);font-size:12px;line-height:1.9;}`;
const AboutBand = styled.div`padding:30px;border:1px solid #2b3442;border-radius:16px;background:linear-gradient(110deg,#121a25,#10141c);h3{margin:0;color:var(--text-primary);font-size:19px;}p{max-width:760px;margin:12px 0 0;color:var(--text-muted);font-size:13px;line-height:1.9;}`;
const BottomCTA = styled.section`padding:10px 0 80px;scroll-margin-top:90px;`;
const CTACard = styled.div`padding:48px 22px;border:1px solid #34323a;border-radius:18px;background:radial-gradient(ellipse at 50% 100%,rgba(255,107,53,.13),transparent 65%),#11151e;text-align:center;h2{margin:0;color:#edf2fa;font-family:var(--font-display);font-size:clamp(28px,4vw,42px);letter-spacing:-.05em;}p{max-width:550px;margin:14px auto 0;color:#9aa9c0;font-size:13px;line-height:1.8;}.actions{display:flex;justify-content:center;margin-top:23px;}`;
const Input = styled.input`display:none;`;

const faqs = [
  ["What files can I upload?", "The current upload flow accepts PDF, PNG, JPG, and JPEG files. Choose a clear document you are authorized to share."],
  ["Can I edit my generated portfolio?", "Yes. The application provides an AI-assisted editing workflow where you describe the changes you want and review the updated preview."],
  ["Is the generated content guaranteed to be accurate?", "No. AI output can omit details or introduce errors. Verify your dates, skills, experience, contact details, and links before sharing."],
  ["Do I need to publish my portfolio immediately?", "No. Review and refine the generated portfolio before downloading or deploying it."],
  ["What does PersonaForge cost?", "Pricing and future plans are being finalized. Check the Pricing page for confirmed information."],
];

export default function Landing({ handleUpload, onNavigate }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const selectFile = () => inputRef.current?.click();
  const processFile = (file) => {
    if (!file || !inputRef.current) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    inputRef.current.files = transfer.files;
    handleUpload({ target: inputRef.current });
  };
  const goSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return <Page>
    <Hero id="home"><Container><HeroGrid>
      <div>
        <Badge><Sparkles size={13}/> Resume to portfolio</Badge>
        <Heading>Your Documents.<br/>Your Story.<br/><span>Your Website.</span></Heading>
        <Lead>Turn your resume into a personal portfolio website with AI. Generate a first draft, refine it in plain English, and prepare your work to share.</Lead>
        <Actions>
          <Primary onClick={selectFile}><UploadCloud size={17}/> Upload your resume <ArrowRight size={15}/></Primary>
          <Secondary href="#how-it-works" onClick={(e)=>{e.preventDefault();goSection("how-it-works");}}>How it works <ArrowUpRight size={15}/></Secondary>
        </Actions>
        <FinePrint><ShieldCheck size={14}/> Start with a PDF or image · Review before sharing</FinePrint>
        <Input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(e)=>{const f=e.target.files?.[0];if(f)handleUpload(e);}} />
      </div>
      <DemoFrame onDragOver={(e)=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={(e)=>{e.preventDefault();setDragging(false);processFile(e.dataTransfer.files?.[0]);}} style={{outline:dragging?"2px solid #ff6b35":"none",outlineOffset:3}}>
        <DemoBar><Dots><span/><span/><span/></Dots><Mono>personaforge / portfolio-preview</Mono><LayoutTemplate size={13} color="#8290a5"/></DemoBar>
        <DemoPage>
          <DemoNav><span>YOUR PORTFOLIO</span><DemoLinks><span>About</span><span>Projects</span><span>Contact</span></DemoLinks></DemoNav>
          <DemoHero><DemoCopy><span>YOUR STORY, YOUR WAY</span><h3>A portfolio that feels like you.</h3><p>Bring your experience, projects, and achievements together in one place.</p></DemoCopy><DemoAvatar><LayoutTemplate/></DemoAvatar></DemoHero>
          <DemoSection><strong>Selected work</strong><DemoCards><DemoCard><WandSparkles/><b>Featured project</b><p>Showcase your work and achievements.</p></DemoCard><DemoCard><Globe/><b>Professional profile</b><p>Give visitors a clear picture of your skills.</p></DemoCard></DemoCards></DemoSection>
        </DemoPage>
      </DemoFrame>
    </HeroGrid></Container></Hero>

    <Section id="how-it-works"><Container>
      <SectionHead><span>How it works</span><h2>From document to digital presence.</h2><p>Start with information you already have, then shape it into a website you can confidently review and share.</p></SectionHead>
      <ThreeGrid>
        <Card><Step><div className="num">01</div><div><h3>Upload your resume</h3><p>Provide a supported PDF or image with your experience, skills, and projects.</p></div></Step></Card>
        <Card><Step><div className="num">02</div><div><h3>Generate your first draft</h3><p>PersonaForge uses the supplied information to create the foundation of a portfolio.</p></div></Step></Card>
        <Card><Step><div className="num">03</div><div><h3>Refine and share</h3><p>Request changes, replace images, preview the result, and download or deploy when ready.</p></div></Step></Card>
      </ThreeGrid>
    </Container></Section>

    <Section id="features" style={{background:"rgba(255,255,255,.012)"}}><Container>
      <SectionHead><span>Features</span><h2>Skip the blank page. Focus on your story.</h2><p>A practical toolkit to help you turn existing professional content into a polished online presence.</p></SectionHead>
      <ThreeGrid>
        <Card><div className="icon"><FileText size={19}/></div><h3>Resume-based generation</h3><p>Start from the professional information you already have instead of building everything from scratch.</p></Card>
        <Card><div className="icon"><WandSparkles size={19}/></div><h3>AI-assisted refinement</h3><p>Describe the changes you want in plain English and review the updated portfolio.</p></Card>
        <Card><div className="icon"><Globe size={19}/></div><h3>A portfolio in one place</h3><p>Present your background, experience, projects, and contact information together.</p></Card>
        <Card><div className="icon"><MessageSquareText size={19}/></div><h3>Personalized content</h3><p>Iterate on the first draft to better reflect your goals and professional identity.</p></Card>
        <Card><div className="icon"><Check size={19}/></div><h3>Preview and download</h3><p>Review your website and export a self-contained HTML file for manual hosting.</p></Card>
        <Card><div className="icon"><Zap size={19}/></div><h3>Deployment workflow</h3><p>Use the available deployment flow to publish your portfolio when you are ready.</p></Card>
      </ThreeGrid>
    </Container></Section>

    <Section id="about"><Container><AboutBand><span style={{color:"var(--ember)",font:"10px var(--font-mono)",letterSpacing:".12em"}}>ABOUT PERSONAFORGE</span><h3 style={{marginTop:12}}>Make your work easier to discover.</h3><p>PersonaForge is built around a simple idea: your professional story should not be trapped inside a document. We are creating a simpler way to turn existing information into a personal website, with AI helping you get started and editing tools helping you make it your own.</p><Actions><Secondary href="/about" onClick={(e)=>{e.preventDefault();onNavigate?.("/about");}}>More about us <ArrowUpRight size={15}/></Secondary></Actions></AboutBand></Container></Section>

    <Section id="faq"><Container>
      <SectionHead><span>FAQ</span><h2>Questions, answered.</h2><p>What to know before creating your portfolio with PersonaForge.</p></SectionHead>
      <FAQ>{faqs.map(([q,a])=><FAQItem key={q}><summary>{q}<ChevronDown size={16}/></summary><p>{a}</p></FAQItem>)}</FAQ>
    </Container></Section>

    <BottomCTA><Container><CTACard><h2>Give your experience a home.</h2><p>Start with your resume, shape the result, and create a portfolio that helps people understand what you do.</p><div className="actions"><Primary onClick={selectFile}><UploadCloud size={17}/> Create my portfolio <ArrowRight size={15}/></Primary></div></CTACard></Container></BottomCTA>
  </Page>;
}
