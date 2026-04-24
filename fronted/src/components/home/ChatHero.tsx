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
          <p className="hero-kicker">Enterprise Research Matching Workspace</p>
          <h1 className="home-title">{title}</h1>
        </div>
      </div>

      <div className="hero-meta-row">
        <span className="hero-mode-badge">{modeLabel}</span>
        <span className="hero-meta-copy">从需求澄清到论文、专利与机构线索的一体化工作流</span>
      </div>

      <p>{subtitle}</p>
    </section>
  );
}
