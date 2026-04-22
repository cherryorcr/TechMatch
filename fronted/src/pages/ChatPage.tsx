import { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ApiError } from '../api/chatApi';
import { RecommendationPanel } from '../components/home/RecommendationPanel';
import { useChatSessions } from '../context/ChatSessionsContext';

export function ChatPage() {
  const { sessionId = '' } = useParams();
  const {
    appendMessage,
    error,
    getRecommendationPanel,
    getSessionById,
    isAppendingMessage,
    isLoadingSession,
    loadSession,
  } = useChatSessions();
  const session = getSessionById(sessionId);
  const recommendationPanel = getRecommendationPanel(sessionId);
  const [draft, setDraft] = useState('');
  const [missingSession, setMissingSession] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const thread = threadRef.current;

    if (!thread) {
      return;
    }

    thread.scrollTop = thread.scrollHeight;
  }, [session?.messages.length]);

  useEffect(() => {
    let isActive = true;

    setMissingSession(false);
    setPageError(null);

    if (!sessionId || (session && recommendationPanel)) {
      return () => {
        isActive = false;
      };
    }

    void loadSession(sessionId).catch((requestError) => {
      if (!isActive) {
        return;
      }

      if (requestError instanceof ApiError && requestError.status === 404) {
        setMissingSession(true);
        return;
      }

      setPageError(
        requestError instanceof Error ? requestError.message : '加载会话详情失败',
      );
    });

    return () => {
      isActive = false;
    };
  }, [loadSession, recommendationPanel, session, sessionId]);

  async function handleSubmit() {
    const trimmed = draft.trim();

    if (!trimmed || !session) {
      return;
    }

    try {
      setPageError(null);
      await appendMessage({
        prompt: trimmed,
        sessionId: session.id,
      });
      setDraft('');
    } catch (requestError) {
      setPageError(
        requestError instanceof Error ? requestError.message : '发送消息失败',
      );
    }
  }

  if (missingSession) {
    return <Navigate replace to="/" />;
  }

  if (!session) {
    return (
      <div className="chat-page">
        <div className="chat-layout">
          <div className="chat-main-column">
            <section className="panel page-status-card">
              <strong>
                {isLoadingSession(sessionId) ? '正在加载会话...' : '暂时无法显示该会话'}
              </strong>
              <p>
                {pageError || error || '请稍候，正在从后端同步这条会话记录。'}
              </p>
              {!isLoadingSession(sessionId) ? (
                <button
                  className="retry-button"
                  type="button"
                  onClick={() => void loadSession(sessionId).catch(() => undefined)}
                >
                  重新加载
                </button>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    );
  }

  const userTurnCount = session.messages.filter((message) => message.role === 'user').length;
  const activeError = pageError || error;
  const sending = isAppendingMessage(session.id);

  return (
    <div className="chat-page">
      <div className="chat-layout">
        <div className="chat-main-column">
          <div className="chat-page-header">
            <div>
              <span className="eyebrow">多轮匹配对话</span>
              <h1>{session.title}</h1>
              <p>
                当前模式：{session.modeLabel} · 匹配论文数：Top {session.options.paperCount} ·
                {session.options.showReasoning ? ' 展示思考过程' : ' 不展示思考过程'} ·
                已补充 {Math.max(userTurnCount - 1, 0)} 轮信息
              </p>
            </div>
          </div>

          {activeError ? <div className="status-banner status-banner-error">{activeError}</div> : null}

          <div ref={threadRef} className="chat-thread">
            {session.messages.map((message) => (
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
              void handleSubmit();
            }}
          >
            <div className="chat-composer-shell">
              <textarea
                disabled={sending}
                placeholder="继续补充你的约束、目标、合作偏好，或希望优先匹配的对象..."
                rows={4}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />

              <div className="chat-composer-footer">
                <span>这是一个多轮对话式匹配流程，补充得越具体，右侧推荐会越贴近当前需求。</span>
                <button disabled={sending || !draft.trim()} type="submit">
                  {sending ? '发送中...' : '发送'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {recommendationPanel ? (
          <RecommendationPanel
            modeLabel={session.modeLabel}
            panel={recommendationPanel}
          />
        ) : (
          <aside className="recommendation-column">
            <section className="panel page-status-card">
              <strong>正在加载推荐面板...</strong>
              <p>会话详情返回后，这里会展示后端生成的推荐结果和追问建议。</p>
            </section>
          </aside>
        )}
      </div>
    </div>
  );
}
