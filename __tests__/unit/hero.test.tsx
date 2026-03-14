import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import HeroSection from "@/components/hero-section";

// Mock sub-components that use motion or complex logic
jest.mock("@/components/header", () => ({
  HeroHeader: () => <header data-testid="hero-header" />,
}));

jest.mock("@/components/ui/animated-group", () => ({
  AnimatedGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animated-group">{children}</div>
  ),
}));

jest.mock("@/components/ui/text-effect", () => ({
  TextEffect: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="text-effect">{children}</div>
  ),
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

describe("HeroSection", () => {
  it("renders the main heading", () => {
    render(<HeroSection />);
    const heading = screen.getByText(/Rethink the way you write/i);
    expect(heading).toBeInTheDocument();
  });

  it("renders the start free button", () => {
    render(<HeroSection />);
    const buttons = screen.getAllByRole("link", { name: /start free/i });
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons[0]).toHaveAttribute("href", "/sign-up");
  });
});
