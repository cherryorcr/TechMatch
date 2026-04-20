interface PlaceholderPageProps {
  title: string;
  description: string;
  highlights: string[];
}

export function PlaceholderPage({ title, description, highlights }: PlaceholderPageProps) {
  return (
    <div className="page-grid">
      <section className="panel placeholder-hero">
        <span className="eyebrow">Foundation Screen</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </section>

      <section className="panel placeholder-list">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Planned Modules</span>
            <h3>Initial placeholders</h3>
          </div>
        </div>

        <div className="placeholder-cards">
          {highlights.map((highlight) => (
            <article key={highlight} className="placeholder-card">
              <strong>{highlight}</strong>
              <p>This block is ready for real components and backend integration in the next phase.</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
