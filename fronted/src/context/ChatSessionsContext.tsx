import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { chatApi } from '../api/chatApi';
import type {
  ChatSession,
  ChatSessionSummary,
  ContextualRecommendationState,
  CreateSessionPayload,
} from '../types/chat';

interface ChatSessionsContextValue {
  sessionSummaries: ChatSessionSummary[];
  createSession: (params: CreateSessionPayload) => Promise<string>;
  appendMessage: (params: { prompt: string; sessionId: string }) => Promise<void>;
  getRecommendationPanel: (sessionId: string) => ContextualRecommendationState | undefined;
  getSessionById: (sessionId: string) => ChatSession | undefined;
  isAppendingMessage: (sessionId: string) => boolean;
  isCreatingSession: boolean;
  isLoadingSession: (sessionId: string) => boolean;
  isLoadingSessions: boolean;
  loadSession: (sessionId: string) => Promise<ChatSession>;
  refreshSessions: () => Promise<void>;
  clearError: () => void;
  error: string | null;
}

const ChatSessionsContext = createContext<ChatSessionsContextValue | undefined>(undefined);

function sortSummaries(summaries: ChatSessionSummary[]) {
  return [...summaries].sort((left, right) => right.updatedAt - left.updatedAt);
}

function toSessionSummary(session: ChatSession): ChatSessionSummary {
  return {
    id: session.id,
    latestMessage: session.messages[session.messages.length - 1]?.content ?? '',
    modeId: session.modeId,
    modeLabel: session.modeLabel,
    options: session.options,
    title: session.title,
    updatedAt: session.updatedAt,
  };
}

function upsertSummary(
  current: ChatSessionSummary[],
  nextSummary: ChatSessionSummary,
) {
  const remaining = current.filter((session) => session.id !== nextSummary.id);
  return sortSummaries([nextSummary, ...remaining]);
}

export function ChatSessionsProvider({ children }: { children: ReactNode }) {
  const [sessionSummaries, setSessionSummaries] = useState<ChatSessionSummary[]>([]);
  const [sessionById, setSessionById] = useState<Record<string, ChatSession>>({});
  const [recommendationBySessionId, setRecommendationBySessionId] = useState<
    Record<string, ContextualRecommendationState>
  >({});
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [loadingSessionIds, setLoadingSessionIds] = useState<Record<string, boolean>>({});
  const [appendingSessionIds, setAppendingSessionIds] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getSessionById = useCallback(
    (sessionId: string) => sessionById[sessionId],
    [sessionById],
  );

  const getRecommendationPanel = useCallback(
    (sessionId: string) => recommendationBySessionId[sessionId],
    [recommendationBySessionId],
  );

  const isLoadingSession = useCallback(
    (sessionId: string) => Boolean(loadingSessionIds[sessionId]),
    [loadingSessionIds],
  );

  const isAppendingMessage = useCallback(
    (sessionId: string) => Boolean(appendingSessionIds[sessionId]),
    [appendingSessionIds],
  );

  const refreshSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    setError(null);

    try {
      const response = await chatApi.listSessions();
      setSessionSummaries(sortSummaries(response.sessions));
    } catch (requestError) {
      const nextMessage =
        requestError instanceof Error ? requestError.message : '加载会话列表失败';
      setError(nextMessage);
      throw requestError;
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    setLoadingSessionIds((current) => ({ ...current, [sessionId]: true }));
    setError(null);

    try {
      const response = await chatApi.getSession(sessionId);
      setSessionById((current) => ({
        ...current,
        [sessionId]: response.session,
      }));
      setRecommendationBySessionId((current) => ({
        ...current,
        [sessionId]: response.recommendationPanel,
      }));
      setSessionSummaries((current) => upsertSummary(current, toSessionSummary(response.session)));
      return response.session;
    } catch (requestError) {
      const nextMessage =
        requestError instanceof Error ? requestError.message : '加载会话详情失败';
      setError(nextMessage);
      throw requestError;
    } finally {
      setLoadingSessionIds((current) => {
        const nextState = { ...current };
        delete nextState[sessionId];
        return nextState;
      });
    }
  }, []);

  const createSession = useCallback(async (params: CreateSessionPayload) => {
    setIsCreatingSession(true);
    setError(null);

    try {
      const response = await chatApi.createSession(params);
      setSessionById((current) => ({
        ...current,
        [response.session.id]: response.session,
      }));
      setRecommendationBySessionId((current) => ({
        ...current,
        [response.session.id]: response.recommendationPanel,
      }));
      setSessionSummaries((current) => upsertSummary(current, toSessionSummary(response.session)));
      return response.session.id;
    } catch (requestError) {
      const nextMessage =
        requestError instanceof Error ? requestError.message : '创建会话失败';
      setError(nextMessage);
      throw requestError;
    } finally {
      setIsCreatingSession(false);
    }
  }, []);

  const appendMessage = useCallback(async (params: { prompt: string; sessionId: string }) => {
    const { prompt, sessionId } = params;
    setAppendingSessionIds((current) => ({ ...current, [sessionId]: true }));
    setError(null);

    try {
      const response = await chatApi.appendMessage(sessionId, { prompt });
      setSessionById((current) => ({
        ...current,
        [sessionId]: response.session,
      }));
      setRecommendationBySessionId((current) => ({
        ...current,
        [sessionId]: response.recommendationPanel,
      }));
      setSessionSummaries((current) => upsertSummary(current, toSessionSummary(response.session)));
    } catch (requestError) {
      const nextMessage =
        requestError instanceof Error ? requestError.message : '发送消息失败';
      setError(nextMessage);
      throw requestError;
    } finally {
      setAppendingSessionIds((current) => {
        const nextState = { ...current };
        delete nextState[sessionId];
        return nextState;
      });
    }
  }, []);

  useEffect(() => {
    void refreshSessions().catch(() => undefined);
  }, [refreshSessions]);

  const value = useMemo<ChatSessionsContextValue>(
    () => ({
      appendMessage,
      clearError,
      createSession,
      error,
      getRecommendationPanel,
      getSessionById,
      isAppendingMessage,
      isCreatingSession,
      isLoadingSession,
      isLoadingSessions,
      loadSession,
      refreshSessions,
      sessionSummaries,
    }),
    [
      appendMessage,
      clearError,
      createSession,
      error,
      getRecommendationPanel,
      getSessionById,
      isAppendingMessage,
      isCreatingSession,
      isLoadingSession,
      isLoadingSessions,
      loadSession,
      refreshSessions,
      sessionSummaries,
    ],
  );

  return <ChatSessionsContext.Provider value={value}>{children}</ChatSessionsContext.Provider>;
}

export function useChatSessions() {
  const context = useContext(ChatSessionsContext);

  if (!context) {
    throw new Error('useChatSessions must be used within ChatSessionsProvider.');
  }

  return context;
}
