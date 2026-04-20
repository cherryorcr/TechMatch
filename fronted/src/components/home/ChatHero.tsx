interface ChatHeroProps {
  modeLabel: string;
  title: string;
  subtitle: string;
}

export function ChatHero({ modeLabel, title, subtitle }: ChatHeroProps) {
  return (
    <section className="home-hero">
      <div className="hero-brand-row">
        <span className="hero-brand-mark">
          <img alt="TechMatch" src="/techmatch-logo.svg" />
        </span>

        <div>
          <span className="eyebrow">TechMatch AI</span>
          <h1 className="home-title">{title}</h1>
        </div>
      </div>

      <p>{subtitle}</p>
      <span className="hero-mode-badge">{modeLabel}</span>
    </section>
  );
}
