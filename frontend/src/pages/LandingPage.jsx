import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Features, { WhyChooseUs } from '../components/Features.jsx';
import Integrations from '../components/Integrations.jsx';
import Pricing from '../components/Pricing.jsx';
import Companies from '../components/Companies.jsx';
import Footer from '../components/Footer.jsx';

export default function LandingPage({ onAuthSuccess }) {
  return (
    <div className="app" id="top">
      <Navbar />
      <main>
        <Hero onAuthSuccess={onAuthSuccess} />
        <Features />
        <Integrations />
        <Pricing />
        <Companies />
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  );
}
