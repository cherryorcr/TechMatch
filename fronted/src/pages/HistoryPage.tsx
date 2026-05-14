import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useChatSessions } from '../context/ChatSessionsContext';

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(timestamp);
}

export function HistoryPage() {
  const { error, isLoadingSessions, refreshSessions, sessionSummaries } = useChatSessions();
  const sessionCards = useMemo(
    () =>
      sessionSummaries.map((session) => ({
        id: session.id,
        title: session.title,
        modeLabel: session.modeLabel,
        updatedAt: formatTime(session.updatedAt),
        latestMessage: session.latestMessage || '暂无对话内容',
        matchContent: session.options.matchContent,
        paperCount: session.options.paperCount,
        showReasoning: session.options.showReasoning,
      })),
    [sessionSummaries],
  );

  return (
    <div className="page-grid history-page">
      <section className="panel history-page-header-panel">
        <span className="eyebrow">History</span>
        <h2>历史对话记录</h2>
        <p>这里展示所有已经发起的多轮匹配对话，点击任意记录可回到对应聊天界面继续补充信息。</p>
      </section>

      {error ? (
        <div className="status-banner status-banner-error">
          <span>{error}</span>
          <button className="retry-button" type="button" onClick={() => void refreshSessions()}>
            重试
          </button>
        </div>
      ) : null}

      <section className="history-card-list">
        {sessionCards.length > 0 ? (
          sessionCards.map((session) => (
            <Link key={session.id} className="history-record-card" to={`/chat/${session.id}`}>
              <div className="history-record-top">
                <strong>{session.title}</strong>
                <span>{session.updatedAt}</span>
              </div>
              <small>{session.modeLabel}</small>
              <p>{session.latestMessage}</p>
              <div className="history-record-meta">
                <span>{session.matchContent}</span>
                <span>Top {session.paperCount}</span>
                <span>{session.showReasoning ? '展示思考过程' : '隐藏思考过程'}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="panel page-status-card">
            <strong>{isLoadingSessions ? '正在加载历史会话...' : '还没有历史会话'}</strong>
            <p>
              {isLoadingSessions
                ? '请稍候，正在从后端同步会话记录。'
                : '创建一次新的对话后，这里会展示最新历史记录。'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
