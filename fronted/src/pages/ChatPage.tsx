import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { RecommendationPanel } from '../components/home/RecommendationPanel';
import { useChatSessions } from '../context/ChatSessionsContext';
import { buildContextualRecommendations } from '../mock/home';

export function ChatPage() {
  const { sessionId = '' } = useParams();
  const { appendMessage, getSessionById } = useChatSessions();
  const session = getSessionById(sessionId);
  const [draft, setDraft] = useState('');
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const thread = threadRef.current;

    if (!thread) {
      return;
    }

    thread.scrollTop = thread.scrollHeight;
  }, [session?.messages.length]);

  if (!session) {
    return <Navigate replace to="/" />;
  }

  const currentSession = session;
  const userTurnCount = currentSession.messages.filter((message) => message.role === 'user').length;
  const recommendationPanel = useMemo(
    () =>
      buildContextualRecommendations(
        currentSession.modeId,
        currentSession.messages,
        currentSession.options,
      ),
    [currentSession.messages, currentSession.modeId, currentSession.options],
  );

  function handleSubmit() {
    const trimmed = draft.trim();

    if (!trimmed) {
      return;
    }

    appendMessage({
      prompt: trimmed,
      sessionId: currentSession.id,
    });
    setDraft('');
  }

  return (
    <div className="chat-page">
      <div className="chat-layout">
        <div className="chat-main-column">
          <div className="chat-page-header">
            <div>
              <span className="eyebrow">多轮匹配对话</span>
              <h1>{currentSession.title}</h1>
              <p>
                当前模式：{currentSession.modeLabel} · 匹配论文数：Top {currentSession.options.paperCount} ·
                {currentSession.options.showReasoning ? ' 展示思考过程' : ' 不展示思考过程'} ·
                已补充 {Math.max(userTurnCount - 1, 0)} 轮信息
              </p>
            </div>
          </div>

          <div ref={threadRef} className="chat-thread">
            {currentSession.messages.map((message) => (
              <article
                key={message.id}
                className={message.role === 'assistant' ? 'chat-bubble chat-bubble-assistant' : 'chat-bubble chat-bubble-user'}
              >
                <span className="chat-bubble-meta">{message.meta}</span>
                <p>{message.content}</p>

                {message.reasoning ? (
                  <details className="reasoning-block">
                    <summary>思考过程</summary>
                    <p>{message.reasoning}</p>
                  </details>
                ) : null}
              </article>
            ))}
          </div>

          <form
            className="chat-composer"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <div className="chat-composer-shell">
              <textarea
                placeholder="继续补充你的约束、目标、合作偏好，或希望优先匹配的对象..."
                rows={4}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />

              <div className="chat-composer-footer">
                <span>这是一个多轮对话式匹配流程，补充得越具体，右侧推荐会越贴近当前需求。</span>
                <button type="submit">发送</button>
              </div>
            </div>
          </form>
        </div>

        <RecommendationPanel
          modeLabel={currentSession.modeLabel}
          panel={recommendationPanel}
        />
      </div>
    </div>
  );
}
