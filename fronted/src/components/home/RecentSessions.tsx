import type { SessionRecord } from '../../types/chat';

interface RecentSessionsProps {
  sessions: SessionRecord[];
  onOpen: (sessionId: string) => void;
}

function compactText(value: string, maxLength = 34) {
  const normalizedValue = value.replace(/\s+/g, ' ').trim();

  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, maxLength)}...`;
}

export function RecentSessions({ sessions, onOpen }: RecentSessionsProps) {
  return (
    <section className="recent-sessions-strip">
      <div className="section-caption section-caption-inline">
        <span className="eyebrow">最近对话</span>
        <span className="section-caption-note">只显示标题摘要，点击继续。</span>
      </div>

      <div className="session-chip-list">
        {sessions.map((session) => (
          <button
            key={session.id}
            aria-label={`打开对话：${session.title}`}
            className="session-chip"
            title={session.title}
            type="button"
            onClick={() => onOpen(session.id)}
          >
            <strong>{compactText(session.title)}</strong>
            <div className="session-chip-meta-row">
              <span>{compactText(session.modeLabel, 14)}</span>
              {session.timestamp ? <span>{session.timestamp}</span> : null}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
