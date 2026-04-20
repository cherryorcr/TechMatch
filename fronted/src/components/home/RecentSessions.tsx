import { SessionRecord } from '../../mock/home';

interface RecentSessionsProps {
  sessions: SessionRecord[];
  onOpen: (sessionId: string) => void;
}

export function RecentSessions({ sessions, onOpen }: RecentSessionsProps) {
  return (
    <section className="recent-sessions-strip">
      <div className="section-caption section-caption-inline">
        <span className="eyebrow">最近对话</span>
        <span className="section-caption-note">点击后可直接回到对应多轮对话。</span>
      </div>

      <div className="session-chip-list">
        {sessions.map((session) => (
          <button
            key={session.id}
            className="session-chip"
            onClick={() => onOpen(session.id)}
            type="button"
          >
            <strong>{session.title}</strong>
            <span>{session.modeLabel}</span>
            <p>{session.summary}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
