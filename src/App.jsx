import HeroA from './components/HeroA';
import StickyNav from './components/StickyNav';
import {
  ProblemSolution,
  ProcessSection,
  Benefits,
  VibeCodingSection,
  TrustSection,
  Portfolio,
  FAQSection,
  FinalCTA,
  Footer,
} from './components/Sections';
import CustomCursor from './components/animations/CustomCursor';

export default function App() {
  return (
    <div style={{ background: 'var(--bg-page)' }}>
      <CustomCursor />
      <HeroA />
      <StickyNav />
      <ProblemSolution />
      <ProcessSection />
      <Benefits />
      <VibeCodingSection />
      <TrustSection />
      <Portfolio />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
