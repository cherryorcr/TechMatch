import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatHero } from '../components/home/ChatHero';
import { ChatInputBox } from '../components/home/ChatInputBox';
import { ModeSwitcher } from '../components/home/ModeSwitcher';
import { PromptSuggestions } from '../components/home/PromptSuggestions';
import { RecentSessions } from '../components/home/RecentSessions';
import { useChatSessions } from '../context/ChatSessionsContext';
import {
  defaultHomeMode,
  defaultMatchOptions,
  homeModeList,
  homeModes,
  type HomeModeId,
} from '../mock/home';

export function HomePage() {
  const navigate = useNavigate();
  const { createSession, sortedSessions } = useChatSessions();
  const [activeMode, setActiveMode] = useState<HomeModeId>(defaultHomeMode);
  const [draft, setDraft] = useState('');
  const [paperCount, setPaperCount] = useState(defaultMatchOptions.paperCount);
  const [showReasoning, setShowReasoning] = useState(defaultMatchOptions.showReasoning);

  const currentMode = homeModes[activeMode];
  const recentSessions = useMemo(
    () =>
      sortedSessions.slice(0, 4).map((session) => ({
        id: session.id,
        modeId: session.modeId,
        modeLabel: session.modeLabel,
        title: session.title,
        summary: session.messages[session.messages.length - 1]?.content ?? '继续完成这段多轮对话',
        timestamp: '',
        prompt: session.messages.find((message) => message.role === 'user')?.content ?? '',
      })),
    [sortedSessions],
  );

  function handlePaperCountChange(nextValue: number) {
    if (!Number.isFinite(nextValue)) {
      setPaperCount(1);
      return;
    }

    setPaperCount(Math.max(1, Math.min(500, Math.floor(nextValue))));
  }

  function handleSubmit() {
    const trimmed = draft.trim();

    if (!trimmed) {
      return;
    }

    const sessionId = createSession({
      modeId: activeMode,
      options: {
        paperCount,
        showReasoning,
      },
      prompt: trimmed,
    });

    navigate(`/chat/${sessionId}`);
  }

  return (
    <div className="page-grid page-grid-home page-grid-home-single">
      <div className="home-main-stack home-main-stack-centered">
        <section className="panel home-stage-panel">
          <ChatHero
            modeLabel={currentMode.label}
            subtitle={currentMode.subtitle}
            title={currentMode.title}
          />

          <div className="home-input-panel">
            <ChatInputBox
              inputHint={currentMode.inputHint}
              paperCount={paperCount}
              placeholder={currentMode.placeholder}
              showReasoning={showReasoning}
              value={draft}
              onChange={setDraft}
              onPaperCountChange={handlePaperCountChange}
              onShowReasoningChange={setShowReasoning}
              onSubmit={handleSubmit}
            />

            <ModeSwitcher
              activeMode={activeMode}
              modes={homeModeList}
              onChange={setActiveMode}
            />

            <PromptSuggestions suggestions={currentMode.suggestions} onSelect={setDraft} />
          </div>
        </section>

        <section className="panel home-preview-panel">
          <div className="section-caption">
            <span className="eyebrow">开始前可先锁定</span>
            <span className="section-caption-note">
              先给一点结构化线索，后面的多轮对话会更快进入真正的匹配阶段。
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
