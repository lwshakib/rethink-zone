/**
 * This is the public landing page (root route).
 * It comprises a marketing Hero section and a global Footer.
 */

import HeroSection from "@/components/hero-section";
import FooterSection from "@/components/footer";

export default function Home() {
  return (
    <main>
      {/* Primary marketing message and CTA */}
      <HeroSection />
      {/* Site-wide footer with links and social info */}
      <FooterSection />
    </main>
  );
}
