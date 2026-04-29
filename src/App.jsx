import { lazy, Suspense } from 'react';
import HeroA from './components/HeroA';
import StickyNav from './components/StickyNav';
import CustomCursor from './components/animations/CustomCursor';

const ProblemSolution = lazy(() => import('./components/Sections').then((m) => ({ default: m.ProblemSolution })));
const ProcessSection = lazy(() => import('./components/Sections').then((m) => ({ default: m.ProcessSection })));
const VibeCodingSection = lazy(() => import('./components/Sections').then((m) => ({ default: m.VibeCodingSection })));
const TrustSection = lazy(() => import('./components/Sections').then((m) => ({ default: m.TrustSection })));
const Portfolio = lazy(() => import('./components/Sections').then((m) => ({ default: m.Portfolio })));
const FAQSection = lazy(() => import('./components/Sections').then((m) => ({ default: m.FAQSection })));
const FinalCTA = lazy(() => import('./components/Sections').then((m) => ({ default: m.FinalCTA })));
const Footer = lazy(() => import('./components/Sections').then((m) => ({ default: m.Footer })));
const BenefitsRich = lazy(() => import('./components/BenefitsRich'));

export default function App() {
  return (
    <div style={{ background: 'var(--bg-page)' }}>
      <CustomCursor />
      <StickyNav />
      <main>
        <HeroA />
        <Suspense fallback={null}>
          <ProblemSolution />
          <ProcessSection />
          <BenefitsRich />
          <VibeCodingSection />
          <TrustSection />
          <Portfolio />
          <FAQSection />
          <FinalCTA />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
