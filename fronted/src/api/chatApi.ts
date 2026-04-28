import {
  buildContextualRecommendations,
  createSessionTitle,
  homeModes,
} from '../mock/home';
import type {
  AppendMessagePayload,
  ChatMessage,
  ChatSession,
  ChatSessionSummary,
  CreateSessionPayload,
  HomeModeId,
  MatchOptions,
  SessionDetailResponse,
  SessionListResponse,
  UploadFilesResponse,
  UploadedFile,
} from '../types/chat';

const PROCESS_API_BASE_URL = import.meta.env.VITE_PROCESS_API_BASE_URL || '/api';
const SESSION_STORAGE_KEY = 'techmatch.process.sessions.v1';
const DEFAULT_SUBJECT = 'engineer';

const processModeMap: Record<HomeModeId, number> = {
  'internal-industry': 0,
  'external-expert': 1,
  academic: 2,
  'deep-search': 3,
  'tech-recommendation': 4,
};

interface ApiErrorPayload {
  message?: string;
}

interface ProcessRequestPayload {
  mode: number;
  session_id: string;
  message: string;
  requirement: string;
  subject: string;
  'top-k': number;
  cot: boolean;
  if_topk: boolean;
}

interface ProcessResponseData {
  status?: 'success' | 'error' | string;
  stage?: 'chatting' | 'completed' | string;
  final_output?: string;
  requirement_summary?: string;
  tech_directions?: unknown;
  papers_data?: unknown[];
  matched_source_paths?: string[];
  matched_paper_path_mappings?: unknown;
  timings?: unknown;
  maturity?: boolean;
  [key: string]: unknown;
}

interface ProcessResponse {
  status?: 'success' | 'error' | string;
  data?: ProcessResponseData | null;
  message?: string;
  stage?: string;
}

type LocalFileRecord = {
  file: UploadedFile;
  url: string;
};

const localFiles = new Map<string, LocalFileRecord>();

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function joinUrl(baseUrl: string, path: string) {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBase}${path}`;
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

function getErrorMessage(payload: unknown, status: number) {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const value = (payload as ApiErrorPayload).message;

    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  if (status === 404) {
    return '会话不存在';
  }

  if (status >= 500) {
    return '服务暂时不可用，请稍后重试';
  }

  return '请求失败，请稍后重试';
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readStoredSessions() {
  if (typeof window === 'undefined') {
    return [] as ChatSession[];
  }

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!raw) {
      return [] as ChatSession[];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatSession[]) : [];
  } catch {
    return [] as ChatSession[];
  }
}

function writeStoredSessions(sessions: ChatSession[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
}

function sortSessions(sessions: ChatSession[]) {
  return [...sessions].sort((left, right) => right.updatedAt - left.updatedAt);
}

function saveSession(session: ChatSession) {
  const nextSessions = [
    session,
    ...readStoredSessions().filter((storedSession) => storedSession.id !== session.id),
  ];
  writeStoredSessions(sortSessions(nextSessions));
}

function findSession(sessionId: string) {
  return readStoredSessions().find((session) => session.id === sessionId);
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

function resolveFiles(fileIds: string[] = []) {
  return fileIds
    .map((fileId) => localFiles.get(fileId)?.file)
    .filter((file): file is UploadedFile => Boolean(file));
}

function getInitialRequirement(session: ChatSession, fallback: string) {
  return session.messages.find((message) => message.role === 'user')?.content || fallback;
}

function buildProcessPayload(params: {
  message: string;
  modeId: HomeModeId;
  options: MatchOptions;
  requirement: string;
  sessionId: string;
}): ProcessRequestPayload {
  return {
    mode: processModeMap[params.modeId],
    session_id: params.sessionId,
    message: params.message,
    requirement: params.requirement,
    subject: DEFAULT_SUBJECT,
    'top-k': params.options.paperCount,
    cot: params.options.showReasoning,
    if_topk: true,
  };
}

function getProcessStage(response: ProcessResponse) {
  return response.data?.stage || response.stage || '';
}

function getProcessOutput(response: ProcessResponse) {
  const finalOutput = response.data?.final_output;

  if (typeof finalOutput === 'string' && finalOutput.trim()) {
    return finalOutput;
  }

  if (typeof response.message === 'string' && response.message.trim()) {
    return response.message;
  }

  return '后端已处理完成，但没有返回可展示内容。';
}

function hasBusinessError(response: ProcessResponse) {
  return response.status === 'error' || response.data?.status === 'error';
}

function getProcessErrorMessage(response: ProcessResponse) {
  const dataOutput = response.data?.final_output;

  if (typeof dataOutput === 'string' && dataOutput.trim()) {
    return dataOutput;
  }

  if (typeof response.message === 'string' && response.message.trim()) {
    return response.message;
  }

  return '后端处理失败，请补充需求后重试';
}

function stringifyValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join('、');
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return typeof value === 'string' ? value : String(value ?? '');
}

function createReasoning(response: ProcessResponse) {
  const data = response.data;

  if (!data) {
    return undefined;
  }

  const lines: string[] = [];
  const stage = getProcessStage(response);

  if (stage) {
    lines.push(`阶段：${stage}`);
  }

  if (data.requirement_summary) {
    lines.push(`需求总结：${data.requirement_summary}`);
  }

  if (data.tech_directions) {
    lines.push(`技术方向：${stringifyValue(data.tech_directions)}`);
  }

  if (data.matched_source_paths?.length) {
    lines.push(`匹配来源：${data.matched_source_paths.join('、')}`);
  }

  if (data.timings) {
    lines.push(`耗时信息：${stringifyValue(data.timings)}`);
  }

  return lines.length > 0 ? lines.join('\n\n') : undefined;
}

function createAssistantMessage(
  response: ProcessResponse,
  showReasoning: boolean,
): ChatMessage {
  return {
    id: createId('assistant'),
    role: 'assistant',
    content: getProcessOutput(response),
    meta: 'TechMatch AI',
    reasoning: showReasoning ? createReasoning(response) : undefined,
  };
}

function buildRecommendationPanel(session: ChatSession, response?: ProcessResponse) {
  const processStage = response ? getProcessStage(response) : '';
  const forceMatching = processStage === 'completed';
  const userTurnCount = session.messages.filter((message) => message.role === 'user').length;
  const panelMessages =
    forceMatching && userTurnCount < 2
      ? [
          ...session.messages,
          {
            id: 'process-completed-stage',
            role: 'user' as const,
            content: '',
            meta: session.modeLabel,
          },
        ]
      : session.messages;
  const panel = buildContextualRecommendations(session.modeId, panelMessages, session.options);

  if (!response) {
    return panel;
  }

  if (processStage === 'chatting') {
    return {
      ...panel,
      stage: 'clarifying' as const,
      heading: '继续补充需求',
      summary: response.data?.requirement_summary || '后端判断当前需求还需要继续澄清，请根据追问继续补充信息。',
    };
  }

  if (processStage === 'completed') {
    return {
      ...panel,
      stage: 'matching' as const,
      heading:
        session.modeId === 'tech-recommendation' ? '技术方案推荐已生成' : '论文总结已生成',
      summary: response.data?.requirement_summary || panel.summary,
      nextQuestions: [],
    };
  }

  return panel;
}

async function requestProcess(payload: ProcessRequestPayload) {
  const response = await fetch(joinUrl(PROCESS_API_BASE_URL, '/process'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const parsed = (await parseResponse(response)) as ProcessResponse | null;

  if (!response.ok && response.status !== 207) {
    throw new ApiError(getErrorMessage(parsed, response.status), response.status);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new ApiError('后端响应格式不正确', response.status);
  }

  if (hasBusinessError(parsed) && response.status !== 207) {
    throw new ApiError(getProcessErrorMessage(parsed), response.status);
  }

  return parsed;
}

export const chatApi = {
  async appendMessage(sessionId: string, payload: AppendMessagePayload) {
    const currentSession = findSession(sessionId);

    if (!currentSession) {
      throw new ApiError('会话不存在', 404);
    }

    const now = Date.now();
    const userMessage: ChatMessage = {
      id: createId('user'),
      role: 'user',
      attachments: resolveFiles(payload.fileIds),
      content: payload.prompt,
      meta: currentSession.modeLabel,
    };
    const response = await requestProcess(
      buildProcessPayload({
        message: payload.prompt,
        modeId: currentSession.modeId,
        options: currentSession.options,
        requirement: getInitialRequirement(currentSession, payload.prompt),
        sessionId,
      }),
    );
    const assistantMessage = createAssistantMessage(
      response,
      currentSession.options.showReasoning,
    );
    const session: ChatSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage, assistantMessage],
      updatedAt: now,
    };

    saveSession(session);

    return {
      session,
      recommendationPanel: buildRecommendationPanel(session, response),
    } satisfies SessionDetailResponse;
  },
  async createSession(payload: CreateSessionPayload) {
    const sessionId = createId(`process-mode-${processModeMap[payload.modeId]}`);
    const now = Date.now();
    const modeLabel = homeModes[payload.modeId].label;
    const userMessage: ChatMessage = {
      id: createId('user'),
      role: 'user',
      attachments: resolveFiles(payload.fileIds),
      content: payload.prompt,
      meta: modeLabel,
    };
    const response = await requestProcess(
      buildProcessPayload({
        message: payload.prompt,
        modeId: payload.modeId,
        options: payload.options,
        requirement: payload.prompt,
        sessionId,
      }),
    );
    const assistantMessage = createAssistantMessage(response, payload.options.showReasoning);
    const session: ChatSession = {
      id: sessionId,
      title: createSessionTitle(payload.prompt),
      modeId: payload.modeId,
      modeLabel,
      options: payload.options,
      messages: [userMessage, assistantMessage],
      createdAt: now,
      updatedAt: now,
    };

    saveSession(session);

    return {
      session,
      recommendationPanel: buildRecommendationPanel(session, response),
    } satisfies SessionDetailResponse;
  },
  getSession(sessionId: string) {
    const session = findSession(sessionId);

    if (!session) {
      throw new ApiError('会话不存在', 404);
    }

    return Promise.resolve({
      session,
      recommendationPanel: buildRecommendationPanel(session),
    } satisfies SessionDetailResponse);
  },
  listSessions() {
    return Promise.resolve({
      sessions: sortSessions(readStoredSessions()).map(toSessionSummary),
    } satisfies SessionListResponse);
  },
  getFileDownloadUrl(fileId: string) {
    return localFiles.get(fileId)?.url || '#';
  },
  downloadFile(file: UploadedFile) {
    const link = document.createElement('a');
    link.href = chatApi.getFileDownloadUrl(file.id);
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  async getConfig() {
    const response = await fetch(joinUrl(PROCESS_API_BASE_URL, '/config'), {
      headers: {
        Accept: 'application/json',
      },
    });
    const payload = await parseResponse(response);

    if (!response.ok) {
      throw new ApiError(getErrorMessage(payload, response.status), response.status);
    }

    return payload;
  },
  async uploadFiles(files: File[]) {
    const uploadedFiles = files.map((file) => {
      const uploadedFile: UploadedFile = {
        id: createId('local-file'),
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: Date.now(),
      };

      localFiles.set(uploadedFile.id, {
        file: uploadedFile,
        url: URL.createObjectURL(file),
      });

      return uploadedFile;
    });

    return { files: uploadedFiles } satisfies UploadFilesResponse;
  },
};
