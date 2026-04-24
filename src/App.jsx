import { useReveal } from './components/Primitives';
import HeroA from './components/HeroA';
import {
  ProblemSolution,
  ProcessSection,
  Benefits,
  TrustSection,
  Portfolio,
  FAQSection,
  FinalCTA,
  Footer,
} from './components/Sections';

export default function App() {
  useReveal();
  return (
    <div style={{ background: 'var(--bg-page)' }}>
      <HeroA />
      <ProblemSolution />
      <ProcessSection />
      <Benefits />
      <TrustSection />
      <Portfolio />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
