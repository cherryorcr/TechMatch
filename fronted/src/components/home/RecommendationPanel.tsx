import { ContextualRecommendationState } from '../../mock/home';

interface RecommendationPanelProps {
  modeLabel: string;
  panel: ContextualRecommendationState;
}

export function RecommendationPanel({ modeLabel, panel }: RecommendationPanelProps) {
  const { nextQuestions, recommendations, signals, stage, summary } = panel;

  return (
    <aside className="recommendation-column">
      <section className="panel recommendation-panel">
        <div className="recommendation-head">
          <div>
            <span className="eyebrow">匹配侧栏</span>
            <h3>{panel.heading}</h3>
          </div>
          <span className="status-pill">{modeLabel}</span>
        </div>

        <p className="recommendation-summary">{summary}</p>

        <div className="recommendation-section">
          <h4>{stage === 'matching' ? '当前匹配重点' : '已提取线索'}</h4>
          <div className="direction-tag-list">
            {signals.map((signal) => (
              <span key={signal} className="direction-tag">
                {signal}
              </span>
            ))}
          </div>
        </div>

        {nextQuestions.length > 0 ? (
          <div className="recommendation-section">
            <h4>继续补充</h4>
            <div className="question-chip-list">
              {nextQuestions.map((question) => (
                <article key={question} className="question-chip">
                  {question}
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {recommendations.papers.length > 0 ? (
          <div className="recommendation-section">
            <h4>推荐论文</h4>
            <div className="recommendation-list">
              {recommendations.papers.map((item) => (
                <article key={item.id} className="recommendation-item">
                  <strong>{item.title}</strong>
                  <span>{item.meta}</span>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="recommendation-empty">
            再补充 1 轮信息后，这里会开始出现更贴近当前对话的文献与成果推荐。
          </div>
        )}

        {recommendations.scholars.length > 0 ? (
          <div className="recommendation-section">
            <h4>推荐学者</h4>
            <div className="recommendation-list">
              {recommendations.scholars.map((item) => (
                <article key={item.id} className="recommendation-item">
                  <strong>{item.title}</strong>
                  <span>{item.meta}</span>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {recommendations.institutions.length > 0 ? (
          <div className="recommendation-section">
            <h4>推荐高校 / 科研机构</h4>
            <div className="recommendation-list">
              {recommendations.institutions.map((item) => (
                <article key={item.id} className="recommendation-item">
                  <strong>{item.title}</strong>
                  <span>{item.meta}</span>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        <div className="recommendation-section">
          <h4>{stage === 'matching' ? '相关技术方向' : '优先关注方向'}</h4>
          <div className="direction-tag-list">
            {recommendations.directions.map((direction) => (
              <span key={direction} className="direction-tag">
                {direction}
              </span>
            ))}
          </div>
        </div>
      </section>
    </aside>
  );
}
