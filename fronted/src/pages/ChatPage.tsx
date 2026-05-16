import { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ApiError, chatApi } from '../api/chatApi';
import { ChatMarkdown } from '../components/chat/ChatMarkdown';
import { AttachmentPicker } from '../components/files/AttachmentPicker';
import { RecommendationPanel } from '../components/home/RecommendationPanel';
import { useChatSessions } from '../context/ChatSessionsContext';
import { defaultMatchOptions, matchContentOptions, paperCountOptions } from '../mock/home';
import type { ChatMessage, MatchContent, MatchOptions } from '../types/chat';
import { formatFileSize } from '../utils/files';

function getMessageStatusLabel(message: ChatMessage) {
  if (message.status === 'sending') {
    return '发送中...';
  }

  if (message.status === 'failed') {
    return '发送失败';
  }

  return null;
}

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
  const [matchContent, setMatchContent] = useState<MatchContent>(defaultMatchOptions.matchContent);
  const [paperCount, setPaperCount] = useState(defaultMatchOptions.paperCount);
  const [showReasoning, setShowReasoning] = useState(defaultMatchOptions.showReasoning);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
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
    if (!session) {
      return;
    }

    setMatchContent(session.options.matchContent);
    setPaperCount(session.options.paperCount);
    setShowReasoning(session.options.showReasoning);
  }, [session?.id]);

  useEffect(() => {
    let isActive = true;

    setMissingSession(false);
    setPageError(null);

    if (!sessionId || session) {
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
  }, [loadSession, session, sessionId]);

  function handlePaperCountChange(nextValue: number) {
    if (!Number.isFinite(nextValue)) {
      setPaperCount(1);
      return;
    }

    setPaperCount(Math.max(1, Math.min(500, Math.floor(nextValue))));
  }

  async function handleSubmit(nextPrompt?: string) {
    const prompt = (nextPrompt ?? draft).trim();

    if (!prompt || !session) {
      return;
    }

    setPageError(null);

    try {
      setIsUploadingFiles(!nextPrompt && selectedFiles.length > 0);
      const uploadedFiles =
        !nextPrompt && selectedFiles.length > 0
          ? (await chatApi.uploadFiles(selectedFiles)).files
          : [];
      await appendMessage({
        files: uploadedFiles,
        options: {
          matchContent,
          paperCount,
          showReasoning,
        } satisfies MatchOptions,
        prompt,
        sessionId: session.id,
      });
      if (!nextPrompt) {
        setDraft('');
        setSelectedFiles([]);
      }
    } catch (requestError) {
      setPageError(
        requestError instanceof Error ? requestError.message : '发送消息失败',
      );
    } finally {
      setIsUploadingFiles(false);
    }
  }

  function handleAddFiles(files: File[]) {
    setPageError(null);
    setSelectedFiles((current) => [...current, ...files]);
  }

  function handleRemoveFile(index: number) {
    setPageError(null);
    setSelectedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
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
  const sending = isAppendingMessage(session.id) || isUploadingFiles;

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
                匹配内容：{session.options.matchContent} ·
                {session.options.showReasoning ? ' 显示思考过程' : ' 不显示思考过程'} ·
                已补充 {Math.max(userTurnCount - 1, 0)} 轮信息
              </p>
            </div>
          </div>

          {activeError ? <div className="status-banner status-banner-error">{activeError}</div> : null}

          <div ref={threadRef} className="chat-thread">
            {session.messages.map((message) => {
              const statusLabel = getMessageStatusLabel(message);
              const isFailedUserMessage = message.role === 'user' && message.status === 'failed';

              return (
                <article
                  key={message.id}
                  className={
                    message.role === 'assistant'
                      ? 'chat-bubble chat-bubble-assistant'
                      : 'chat-bubble chat-bubble-user'
                  }
                >
                  <div className="chat-bubble-head">
                    <span className="chat-bubble-meta">{message.meta}</span>
                    {statusLabel ? (
                      <span
                        className={
                          message.status === 'failed'
                            ? 'chat-bubble-status chat-bubble-status-failed'
                            : 'chat-bubble-status'
                        }
                      >
                        {statusLabel}
                      </span>
                    ) : null}
                  </div>

                  <ChatMarkdown className="chat-markdown" content={message.content} />

                  {message.attachments && message.attachments.length > 0 ? (
                    <div className="message-attachment-list">
                      {message.attachments.map((file) => (
                        <a
                          key={file.id}
                          className="message-attachment-link"
                          download={file.name}
                          href={chatApi.getFileDownloadUrl(file.id)}
                        >
                          <span>{file.name}</span>
                          <small>{formatFileSize(file.size)}</small>
                        </a>
                      ))}
                    </div>
                  ) : null}

                  {isFailedUserMessage ? (
                    <div className="chat-bubble-actions">
                      <button
                        className="retry-button"
                        disabled={sending}
                        type="button"
                        onClick={() => void handleSubmit(message.content)}
                      >
                        重试发送
                      </button>
                    </div>
                  ) : null}

                  {message.reasoning ? (
                    <details className="reasoning-block">
                      <summary>思考过程</summary>
                      <ChatMarkdown className="chat-markdown" content={message.reasoning} />
                    </details>
                  ) : null}
                </article>
              );
            })}
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

              <AttachmentPicker
                disabled={isAppendingMessage(session.id)}
                files={selectedFiles}
                hint="附件会随本轮追问一起发送，用于补充论文、报告或需求材料。"
                isUploading={isUploadingFiles}
                label="添加附件"
                onAddFiles={handleAddFiles}
                onRemoveFile={handleRemoveFile}
              />

              <div className="chat-composer-options" aria-label="本轮匹配参数">
                <label className="home-option-field home-option-stepper">
                  <span>TopK</span>
                  <div className="count-stepper">
                    <button
                      disabled={sending}
                      type="button"
                      onClick={() => handlePaperCountChange(Math.max(1, paperCount - 1))}
                    >
                      -
                    </button>
                    <input
                      disabled={sending}
                      min={1}
                      step={1}
                      type="number"
                      value={paperCount}
                      onChange={(event) => handlePaperCountChange(Number(event.target.value))}
                    />
                    <button
                      disabled={sending}
                      type="button"
                      onClick={() => handlePaperCountChange(paperCount + 1)}
                    >
                      +
                    </button>
                  </div>
                </label>

                <label className="home-option-field home-option-content">
                  <span>匹配内容</span>
                  <select
                    className="match-content-select"
                    disabled={sending}
                    value={matchContent}
                    onChange={(event) => setMatchContent(event.target.value as MatchContent)}
                  >
                    {matchContentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="home-option-toggle">
                  <input
                    checked={showReasoning}
                    disabled={sending}
                    type="checkbox"
                    onChange={(event) => setShowReasoning(event.target.checked)}
                  />
                  <span>思考过程</span>
                </label>

                <div className="home-option-presets">
                  {paperCountOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      disabled={sending}
                      className={paperCount === option ? 'paper-preset paper-preset-active' : 'paper-preset'}
                      onClick={() => handlePaperCountChange(option)}
                    >
                      Top {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="chat-composer-footer">
                <span>
                  这是一个多轮对话式匹配流程，补充得越具体，右侧推荐会越贴近当前需求。
                </span>
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
