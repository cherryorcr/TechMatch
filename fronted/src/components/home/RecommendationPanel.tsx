import type { ContextualRecommendationState } from '../../types/chat';

interface RecommendationPanelProps {
  modeLabel: string;
  panel: ContextualRecommendationState;
}

function getPanelLabels(modeLabel: string) {
  if (modeLabel.includes('深度搜索')) {
    return {
      empty: '再补充 1 轮信息后，这里会开始出现更贴近当前需求的代表论文与总结线索。',
      institution: '推荐检索入口',
      paper: '代表论文',
      scholar: '相关研究线索',
    };
  }

  if (modeLabel.includes('技术推荐')) {
    return {
      empty: '再补充 1 轮信息后，这里会开始出现更贴近当前需求的技术方案建议。',
      institution: '推荐实施路径',
      paper: '推荐方案',
      scholar: '方案顾问画像',
    };
  }

  return {
    empty: '再补充 1 轮信息后，这里会开始出现更贴近当前对话的文献与成果推荐。',
    institution: '推荐高校 / 科研机构',
    paper: '推荐论文',
    scholar: '推荐学者',
  };
}

export function RecommendationPanel({ modeLabel, panel }: RecommendationPanelProps) {
  const { nextQuestions, recommendations, signals, stage, summary } = panel;
  const labels = getPanelLabels(modeLabel);

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
            <h4>{labels.paper}</h4>
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
            {labels.empty}
          </div>
        )}

        {recommendations.scholars.length > 0 ? (
          <div className="recommendation-section">
            <h4>{labels.scholar}</h4>
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
            <h4>{labels.institution}</h4>
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
