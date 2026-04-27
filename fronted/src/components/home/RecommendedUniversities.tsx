import {
  getAcademicUniversityLogoUrl,
  getFeaturedAcademicInstitutions,
} from '../../mock/academicUniversities';

export function RecommendedUniversities() {
  const recommendedUniversities = getFeaturedAcademicInstitutions();

  return (
    <section className="academic-recommendation-section" aria-labelledby="academic-recommendations-title">
      <div className="academic-section-head">
        <div>
          <span id="academic-recommendations-title" className="eyebrow">
            高校 / 产业机构卡片
          </span>
          <h2>优先跟踪这些公开资料入口</h2>
        </div>
        <p>
          默认展示华中科技大学、西安交通大学、中国机械工业集团、中国轻工集团和中科曙光，卡片内链接指向官网、学院或科技创新入口。
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
