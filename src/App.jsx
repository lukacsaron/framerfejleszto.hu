import HeroA from './components/HeroA';
import StickyNav from './components/StickyNav';
import {
  ProblemSolution,
  ProcessSection,
  VibeCodingSection,
  TrustSection,
  Portfolio,
  FAQSection,
  FinalCTA,
  Footer,
} from './components/Sections';
import BenefitsRich from './components/BenefitsRich';
import CustomCursor from './components/animations/CustomCursor';

export default function App() {
  return (
    <div style={{ background: 'var(--bg-page)' }}>
      <CustomCursor />
      <HeroA />
      <StickyNav />
      <ProblemSolution />
      <ProcessSection />
      <BenefitsRich />
      <VibeCodingSection />
      <TrustSection />
      <Portfolio />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
