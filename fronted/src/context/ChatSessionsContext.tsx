import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  buildAssistantReply,
  createSeedSessions,
  createSessionTitle,
  homeModes,
  type ChatMessage,
  type ChatSession,
  type HomeModeId,
  type MatchOptions,
} from '../mock/home';

const CHAT_STORAGE_KEY = 'techmatch.chat.sessions.v2';

interface ChatSessionsContextValue {
  sessions: ChatSession[];
  sortedSessions: ChatSession[];
  createSession: (params: {
    modeId: HomeModeId;
    options: MatchOptions;
    prompt: string;
  }) => string;
  appendMessage: (params: { prompt: string; sessionId: string }) => void;
  getSessionById: (sessionId: string) => ChatSession | undefined;
}

const ChatSessionsContext = createContext<ChatSessionsContextValue | undefined>(undefined);

function loadInitialSessions() {
  if (typeof window === 'undefined') {
    return createSeedSessions();
  }

  const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);

  if (!raw) {
    return createSeedSessions();
  }

  try {
    const parsed = JSON.parse(raw) as ChatSession[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return createSeedSessions();
    }

    return parsed;
  } catch {
    return createSeedSessions();
  }
}

export function ChatSessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>(loadInitialSessions);

  useEffect(() => {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const sortedSessions = useMemo(
    () => [...sessions].sort((left, right) => right.updatedAt - left.updatedAt),
    [sessions],
  );

  function createSession(params: {
    modeId: HomeModeId;
    options: MatchOptions;
    prompt: string;
  }) {
    const { modeId, options, prompt } = params;
    const sessionId = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const userMessage: ChatMessage = {
      id: `${sessionId}-user-1`,
      role: 'user',
      content: prompt,
      meta: homeModes[modeId].label,
    };
    const reply = buildAssistantReply(modeId, prompt, options, 1);
    const assistantMessage: ChatMessage = {
      id: `${sessionId}-assistant-1`,
      role: 'assistant',
      content: reply.content,
      meta: 'TechMatch AI',
      reasoning: reply.reasoning,
    };
    const timestamp = Date.now();
    const nextSession: ChatSession = {
      id: sessionId,
      title: createSessionTitle(prompt),
      modeId,
      modeLabel: homeModes[modeId].label,
      options,
      messages: [userMessage, assistantMessage],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setSessions((current) => [nextSession, ...current]);

    return sessionId;
  }

  function appendMessage(params: { prompt: string; sessionId: string }) {
    const { prompt, sessionId } = params;

    setSessions((current) =>
      current.map((session) => {
        if (session.id !== sessionId) {
          return session;
        }

        const nextUserCount =
          session.messages.filter((message) => message.role === 'user').length + 1;
        const userMessage: ChatMessage = {
          id: `${sessionId}-user-${Date.now()}`,
          role: 'user',
          content: prompt,
          meta: session.modeLabel,
        };
        const reply = buildAssistantReply(
          session.modeId,
          prompt,
          session.options,
          nextUserCount,
        );
        const assistantMessage: ChatMessage = {
          id: `${sessionId}-assistant-${Date.now() + 1}`,
          role: 'assistant',
          content: reply.content,
          meta: 'TechMatch AI',
          reasoning: reply.reasoning,
        };

        return {
          ...session,
          title:
            session.messages.length <= 2 ? createSessionTitle(prompt) : session.title,
          messages: [...session.messages, userMessage, assistantMessage],
          updatedAt: Date.now(),
        };
      }),
    );
  }

  function getSessionById(sessionId: string) {
    return sessions.find((session) => session.id === sessionId);
  }

  const value: ChatSessionsContextValue = {
    sessions,
    sortedSessions,
    createSession,
    appendMessage,
    getSessionById,
  };

  return <ChatSessionsContext.Provider value={value}>{children}</ChatSessionsContext.Provider>;
}

export function useChatSessions() {
  const context = useContext(ChatSessionsContext);

  if (!context) {
    throw new Error('useChatSessions must be used within ChatSessionsProvider.');
  }

  return context;
}
