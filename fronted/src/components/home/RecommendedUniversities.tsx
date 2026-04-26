import {
  academicUniversityRecommendations,
  getAcademicUniversityLogoUrl,
  getRecommendedAcademicUniversities,
} from '../../mock/academicUniversities';

interface RecommendedUniversitiesProps {
  historyText: string;
}

export function RecommendedUniversities({ historyText }: RecommendedUniversitiesProps) {
  const recommendedUniversities = getRecommendedAcademicUniversities(historyText, 6);

  return (
    <section className="academic-recommendation-section" aria-labelledby="academic-recommendations-title">
      <div className="academic-section-head">
        <div>
          <span id="academic-recommendations-title" className="eyebrow">
            推荐高校 / 科研机构
          </span>
          <h2>先从这些公开资料入口建立机构画像</h2>
        </div>
        <p>
          已纳入 {academicUniversityRecommendations.length} 所 985 高校作为候选库，并根据历史会话推荐 6 所。没有历史会话时会展示默认样本。
        </p>
      </div>

      <div className="academic-card-grid">
        {recommendedUniversities.map((university) => (
          <article key={university.id} className="academic-card">
            <div className="academic-card-head">
              <div className="academic-logo-mark" aria-hidden="true">
                <img
                  alt=""
                  src={getAcademicUniversityLogoUrl(university.domain)}
                  onError={(event) => {
                    event.currentTarget.parentElement?.classList.add('academic-logo-mark-fallback');
                    event.currentTarget.style.display = 'none';
                  }}
                />
                <span>{university.logoMark}</span>
              </div>
              <div className="academic-card-title">
                <span className="academic-card-kicker">
                  {university.location} · {university.shortName}
                </span>
                <h3>{university.name}</h3>
              </div>
            </div>

            <div className="academic-tag-list" aria-label={`${university.name}重点方向`}>
              {university.tags.map((tag) => (
                <span key={`${university.id}-${tag}`}>{tag}</span>
              ))}
            </div>

            <p className="academic-card-focus">{university.description}</p>

            <div className="academic-source-list">
              {university.links.map((link) => (
                <a
                  key={`${university.id}-${link.label}`}
                  className="academic-source-item"
                  href={link.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <div>
                    <strong>{link.label}</strong>
                    <span>{link.type}</span>
                  </div>
                  <span className="academic-source-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              ))}
            </div>

            <p className="academic-card-note">{university.accessNote}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
