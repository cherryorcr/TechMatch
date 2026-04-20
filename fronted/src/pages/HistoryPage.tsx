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
  const { sortedSessions } = useChatSessions();
  const sessionCards = useMemo(
    () =>
      sortedSessions.map((session) => ({
        id: session.id,
        title: session.title,
        modeLabel: session.modeLabel,
        updatedAt: formatTime(session.updatedAt),
        latestMessage:
          session.messages[session.messages.length - 1]?.content ?? '暂无对话内容',
        paperCount: session.options.paperCount,
        showReasoning: session.options.showReasoning,
      })),
    [sortedSessions],
  );

  return (
    <div className="page-grid history-page">
      <section className="panel history-page-header-panel">
        <span className="eyebrow">History</span>
        <h2>历史对话记录</h2>
        <p>这里展示所有已经发起的多轮匹配对话，点击任意记录可回到对应聊天界面继续补充信息。</p>
      </section>

      <section className="history-card-list">
        {sessionCards.map((session) => (
          <Link key={session.id} className="history-record-card" to={`/chat/${session.id}`}>
            <div className="history-record-top">
              <strong>{session.title}</strong>
              <span>{session.updatedAt}</span>
            </div>
            <small>{session.modeLabel}</small>
            <p>{session.latestMessage}</p>
            <div className="history-record-meta">
              <span>Top {session.paperCount}</span>
              <span>{session.showReasoning ? '展示思考过程' : '隐藏思考过程'}</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
