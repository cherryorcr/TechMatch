import { useEffect, useState } from 'react';
import {
  getFeaturedResearchHighlights,
  researchHighlights,
  type ResearchHighlight,
} from '../../mock/researchHighlights';

export function RecommendedUniversities() {
  const [recommendedHighlights, setRecommendedHighlights] = useState<ResearchHighlight[]>(() =>
    getFeaturedResearchHighlights(9),
  );
  const [selectedHighlight, setSelectedHighlight] = useState<ResearchHighlight | null>(null);

  function handleRefreshRecommendations() {
    setRecommendedHighlights(getFeaturedResearchHighlights(9));
    setSelectedHighlight(null);
  }

  useEffect(() => {
    if (!selectedHighlight) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelectedHighlight(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedHighlight]);

  return (
    <section className="academic-recommendation-section" aria-labelledby="academic-recommendations-title">
      <div className="academic-section-head">
        <div>
          <span id="academic-recommendations-title" className="eyebrow">
            成果 / 专利卡片 · {researchHighlights.length} 项
          </span>
          <h2>优先浏览这些可转化线索</h2>
        </div>
        <div className="academic-section-actions">
          <p>
            覆盖保利中轻技术手册、中科曙光能力介绍、青岛大学专利与可转化成果、西安交通大学科技成果项目，用于快速判断技术方向、成熟度和应用场景。
          </p>
          <button className="recommendation-refresh-button" type="button" onClick={handleRefreshRecommendations}>
            换一批
          </button>
        </div>
      </div>

      <div className="academic-card-grid" aria-live="polite">
        {recommendedHighlights.map((highlight) => (
          <button
            key={highlight.id}
            className="academic-card research-card"
            type="button"
            onClick={() => setSelectedHighlight(highlight)}
          >
            <div className="academic-card-head">
              <div className="academic-logo-mark research-logo-mark" aria-hidden="true">
                <span>{highlight.organization.slice(0, 2)}</span>
              </div>
              <div className="academic-card-title">
                <span className="academic-card-kicker">
                  {highlight.organization} · {highlight.type}
                </span>
                <h3>{highlight.title}</h3>
              </div>
            </div>

            <div className="academic-tag-list" aria-label={`${highlight.title}重点方向`}>
              <span>{highlight.domain}</span>
              {highlight.tags.slice(0, 2).map((tag) => (
                <span key={`${highlight.id}-${tag}`}>{tag}</span>
              ))}
            </div>

            <p className="academic-card-focus">{highlight.summary}</p>

            <div className="research-card-meta">
              <span>{highlight.maturity}</span>
              <strong>查看详情</strong>
            </div>
          </button>
        ))}
      </div>

      {selectedHighlight ? (
        <div
          className="research-detail-overlay"
          onClick={() => setSelectedHighlight(null)}
          role="presentation"
        >
          <section
            aria-labelledby="research-detail-title"
            aria-modal="true"
            className="research-detail-modal"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="research-detail-head">
              <div>
                <span className="eyebrow">
                  {selectedHighlight.organization} · {selectedHighlight.type}
                </span>
                <h3 id="research-detail-title">{selectedHighlight.title}</h3>
              </div>
              <button
                aria-label="关闭详情"
                className="research-detail-close"
                type="button"
                onClick={() => setSelectedHighlight(null)}
              >
                ×
              </button>
            </div>

            <div className="academic-tag-list research-detail-tags">
              <span>{selectedHighlight.domain}</span>
              {selectedHighlight.tags.map((tag) => (
                <span key={`${selectedHighlight.id}-detail-${tag}`}>{tag}</span>
              ))}
            </div>

            <p className="research-detail-summary">{selectedHighlight.detail}</p>

            <dl className="research-detail-facts">
              <div>
                <dt>应用场景</dt>
                <dd>{selectedHighlight.application}</dd>
              </div>
              <div>
                <dt>成熟度 / 备注</dt>
                <dd>{selectedHighlight.maturity}</dd>
              </div>
              <div>
                <dt>资料来源</dt>
                <dd>{selectedHighlight.source}</dd>
              </div>
            </dl>
          </section>
        </div>
      ) : null}
    </section>
  );
}
