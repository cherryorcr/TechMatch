import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi } from '../api/chatApi';
import { ChatHero } from '../components/home/ChatHero';
import { ChatInputBox } from '../components/home/ChatInputBox';
import { ModeSwitcher } from '../components/home/ModeSwitcher';
import { PromptSuggestions } from '../components/home/PromptSuggestions';
import { RecommendedUniversities } from '../components/home/RecommendedUniversities';
import { RecentSessions } from '../components/home/RecentSessions';
import { useChatSessions } from '../context/ChatSessionsContext';
import {
  defaultHomeMode,
  defaultMatchOptions,
  homeModeList,
  homeModes,
  type HomeModeId,
  type MatchContent,
} from '../mock/home';

export function HomePage() {
  const navigate = useNavigate();
  const { createSession, error, isCreatingSession, sessionSummaries } = useChatSessions();
  const [activeMode, setActiveMode] = useState<HomeModeId>(defaultHomeMode);
  const [draft, setDraft] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [matchContent, setMatchContent] = useState<MatchContent>(defaultMatchOptions.matchContent);
  const [paperCount, setPaperCount] = useState(defaultMatchOptions.paperCount);
  const [showReasoning, setShowReasoning] = useState(defaultMatchOptions.showReasoning);

  const currentMode = homeModes[activeMode];
  const recentSessions = useMemo(
    () =>
      sessionSummaries.slice(0, 4).map((session) => ({
        id: session.id,
        modeId: session.modeId,
        modeLabel: session.modeLabel,
        title: session.title,
        summary: session.latestMessage || '继续完成这段多轮对话',
        timestamp: '',
        prompt: '',
      })),
    [sessionSummaries],
  );
  function handlePaperCountChange(nextValue: number) {
    if (!Number.isFinite(nextValue)) {
      setPaperCount(1);
      return;
    }

    setPaperCount(Math.max(1, Math.min(500, Math.floor(nextValue))));
  }

  function handleAddFiles(files: File[]) {
    setFileError(null);
    setSelectedFiles((current) => [...current, ...files]);
  }

  function handleRemoveFile(index: number) {
    setFileError(null);
    setSelectedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  }

  async function handleSubmit() {
    const trimmed = draft.trim();

    if (!trimmed) {
      return;
    }

    setFileError(null);

    try {
      setIsUploadingFiles(selectedFiles.length > 0);
      const uploadedFiles =
        selectedFiles.length > 0 ? (await chatApi.uploadFiles(selectedFiles)).files : [];
      const sessionId = await createSession({
        fileIds: uploadedFiles.map((file) => file.id),
        modeId: activeMode,
        options: {
          matchContent,
          paperCount,
          showReasoning,
        },
        prompt: trimmed,
      });
      setDraft('');
      setSelectedFiles([]);
      navigate(`/chat/${sessionId}`);
    } catch (requestError) {
      setFileError(requestError instanceof Error ? requestError.message : '上传文件或创建会话失败');
      return;
    } finally {
      setIsUploadingFiles(false);
    }
  }

  const activeError = fileError || error;

  return (
    <div className="page-grid page-grid-home page-grid-home-single">
      <div className="home-main-stack home-main-stack-centered">
        <section className="panel home-stage-panel">
          <div className="home-stage-grid">
            <div className="home-stage-copy">
              <ChatHero
                modeLabel={currentMode.label}
                subtitle={currentMode.subtitle}
                title={currentMode.title}
              />

              <div className="hero-signal-strip">
                {currentMode.previewSections.map((section) => (
                  <article key={section.id} className="hero-signal-card">
                    <span>{section.title}</span>
                    <strong>{section.items[0]}</strong>
                  </article>
                ))}
              </div>
            </div>

            <aside className="hero-side-card">
              <span className="eyebrow">Workflow</span>
              <h2>让匹配从“能聊”走向“能决策”</h2>
              <p className="hero-side-intro">
                系统会先澄清输入边界，再输出更适合内部协作的论文、专利与机构线索。
              </p>

              <ol className="hero-step-list">
                {currentMode.previewSections.map((section, index) => (
                  <li key={section.id}>
                    <span className="hero-step-index">0{index + 1}</span>
                    <div>
                      <strong>{section.title}</strong>
                      <p>{section.items.join(' · ')}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
          </div>

          <div className="home-command-shell">
            <div className="home-command-header">
              <div>
                <span className="eyebrow">Start Session</span>
                <h2>从一个明确的问题开始</h2>
                <p>先给出需求、成果或机构目标，再通过多轮澄清进入论文、专利与机构匹配。</p>
              </div>

              <div className="home-command-badges">
                <span className="home-command-pill">Multi-turn</span>
                <span className="home-command-pill">{matchContent}</span>
                <span className="home-command-pill">Top {paperCount}</span>
              </div>
            </div>

            {activeError ? <div className="status-banner status-banner-error">{activeError}</div> : null}

            <ChatInputBox
              disabled={isCreatingSession}
              files={selectedFiles}
              inputHint={currentMode.inputHint}
              isUploadingFiles={isUploadingFiles}
              matchContent={matchContent}
              paperCount={paperCount}
              placeholder={currentMode.placeholder}
              showReasoning={showReasoning}
              value={draft}
              onAddFiles={handleAddFiles}
              onChange={setDraft}
              onMatchContentChange={setMatchContent}
              onPaperCountChange={handlePaperCountChange}
              onRemoveFile={handleRemoveFile}
              onShowReasoningChange={setShowReasoning}
              onSubmit={handleSubmit}
            />
          </div>

          <ModeSwitcher
            activeMode={activeMode}
            modes={homeModeList}
            onChange={setActiveMode}
          />

          <PromptSuggestions suggestions={currentMode.suggestions} onSelect={setDraft} />
        </section>

        <RecommendedUniversities />

        <section className="panel home-preview-panel">
          <div className="section-caption">
            <span className="eyebrow">开始前可先锁定</span>
            <span className="section-caption-note">
              先补充结构化线索，后续多轮对话会更快进入真正的匹配阶段。
            </span>
          </div>

          <div className="preview-grid">
            {currentMode.previewSections.map((section) => (
              <article key={section.id} className="preview-card">
                <strong>{section.title}</strong>
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {recentSessions.length > 0 ? (
          <RecentSessions
            sessions={recentSessions}
            onOpen={(sessionId) => navigate(`/chat/${sessionId}`)}
          />
        ) : null}
      </div>
    </div>
  );
}
