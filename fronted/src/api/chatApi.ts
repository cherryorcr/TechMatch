import {
  buildContextualRecommendations,
  createSessionTitle,
  defaultMatchOptions,
  homeModes,
  matchContentOptions,
} from '../mock/home';
import type {
  AppendMessagePayload,
  ChatMessage,
  ChatSession,
  ChatSessionSummary,
  CreateSessionPayload,
  HomeModeId,
  MatchContent,
  MatchOptions,
  SessionDetailResponse,
  SessionListResponse,
  UploadFilesResponse,
  UploadedFile,
} from '../types/chat';

const configuredProcessApiBaseUrl = import.meta.env.VITE_PROCESS_API_BASE_URL as
  | string
  | undefined;
const PROCESS_API_BASE_URLS =
  configuredProcessApiBaseUrl === undefined
    ? ['/api', '/paper-api']
    : [configuredProcessApiBaseUrl];
const SESSION_STORAGE_KEY = 'techmatch.process.sessions.v1';
const DEFAULT_SUBJECT = 'engineer';
const PROCESS_OUTPUT_DATA_FIELDS = [
  'final_output',
  'finalOutput',
  'html_output',
  'htmlOutput',
  'html',
  'table_html',
  'html_table',
  'content',
  'answer',
  'result',
  'output',
] as const;
const PROCESS_OUTPUT_TOP_LEVEL_FIELDS = [
  'message',
  'content',
  'answer',
  'result',
  'output',
  'html',
  'html_output',
] as const;
const STREAM_DELTA_FIELDS = [
  'delta',
  'text_delta',
  'content_delta',
  'chunk',
  'token',
  'text',
  'content',
  'answer',
  'output',
] as const;
const STREAM_DONE_MESSAGES = new Set(['[DONE]', '[done]', 'DONE', 'done']);

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
  retrieval_type: MatchContent;
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

interface ProcessRequestOptions {
  onOutputDelta?: (delta: string) => void;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function tryParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
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

function isMatchContent(value: unknown): value is MatchContent {
  return matchContentOptions.some((option) => option.value === value);
}

function normalizeMatchOptions(options?: Partial<MatchOptions>): MatchOptions {
  return {
    matchContent: isMatchContent(options?.matchContent)
      ? options.matchContent
      : defaultMatchOptions.matchContent,
    paperCount:
      typeof options?.paperCount === 'number' && Number.isFinite(options.paperCount)
        ? options.paperCount
        : defaultMatchOptions.paperCount,
    showReasoning:
      typeof options?.showReasoning === 'boolean'
        ? options.showReasoning
        : defaultMatchOptions.showReasoning,
  };
}

function normalizeSession(session: ChatSession): ChatSession {
  return {
    ...session,
    options: normalizeMatchOptions(session.options),
  };
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
    return Array.isArray(parsed) ? (parsed as ChatSession[]).map(normalizeSession) : [];
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
  const options = normalizeMatchOptions(params.options);

  return {
    retrieval_type: options.matchContent,
    mode: processModeMap[params.modeId],
    session_id: params.sessionId,
    message: params.message,
    requirement: params.requirement,
    subject: DEFAULT_SUBJECT,
    'top-k': options.paperCount,
    cot: options.showReasoning,
    if_topk: true,
  };
}

function getProcessStage(response: ProcessResponse) {
  return response.data?.stage || response.stage || '';
}

function getFirstStringField(
  source: Record<string, unknown> | null | undefined,
  fields: readonly string[],
) {
  if (!source) {
    return undefined;
  }

  for (const field of fields) {
    const value = source[field];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function getExplicitProcessOutput(response: ProcessResponse) {
  const dataOutput = getFirstStringField(response.data, PROCESS_OUTPUT_DATA_FIELDS);

  if (dataOutput) {
    return dataOutput;
  }

  const topLevelOutput = getFirstStringField(
    response as unknown as Record<string, unknown>,
    PROCESS_OUTPUT_TOP_LEVEL_FIELDS,
  );

  if (topLevelOutput) {
    return topLevelOutput;
  }

  return undefined;
}

function getProcessOutput(response: ProcessResponse) {
  const output = getExplicitProcessOutput(response);

  if (output) {
    return output;
  }

  return '后端已处理完成，但没有返回可展示内容。';
}

function getOpenAiChoiceDelta(payload: Record<string, unknown>) {
  const choices = payload.choices;

  if (!Array.isArray(choices)) {
    return undefined;
  }

  const firstChoice = choices[0];

  if (!isRecord(firstChoice)) {
    return undefined;
  }

  const delta = firstChoice.delta;

  if (isRecord(delta) && typeof delta.content === 'string') {
    return delta.content;
  }

  return typeof firstChoice.text === 'string' ? firstChoice.text : undefined;
}

function getStreamDelta(payload: unknown): string | undefined {
  if (typeof payload === 'string') {
    return payload;
  }

  if (!isRecord(payload)) {
    return undefined;
  }

  const choiceDelta = getOpenAiChoiceDelta(payload);

  if (choiceDelta) {
    return choiceDelta;
  }

  const nestedData = payload.data;

  if (typeof nestedData === 'string') {
    return nestedData;
  }

  if (isRecord(nestedData)) {
    const nestedDelta = getStreamDelta(nestedData);

    if (nestedDelta) {
      return nestedDelta;
    }
  }

  for (const field of STREAM_DELTA_FIELDS) {
    const value = payload[field];

    if (typeof value === 'string') {
      return value;
    }
  }

  return undefined;
}

function isProcessResponsePayload(payload: unknown): payload is ProcessResponse {
  if (!isRecord(payload)) {
    return false;
  }

  return (
    isRecord(payload.data) ||
    typeof payload.stage === 'string' ||
    typeof payload.status === 'string' ||
    PROCESS_OUTPUT_DATA_FIELDS.some((field) => typeof payload[field] === 'string')
  );
}

function createStreamFallbackResponse(output: string): ProcessResponse {
  return {
    status: 'success',
    data: {
      status: 'success',
      final_output: output,
    },
  };
}

function mergeStreamOutput(response: ProcessResponse, output: string): ProcessResponse {
  const explicitOutput = getExplicitProcessOutput(response);

  if (!output.trim() || (explicitOutput && explicitOutput.length >= output.length)) {
    return response;
  }

  const data = isRecord(response.data) ? response.data : {};

  return {
    ...response,
    data: {
      ...data,
      final_output: output,
    },
  };
}

function normalizeStreamResponse(
  lastProcessPayload: ProcessResponse | null,
  accumulatedOutput: string,
) {
  if (lastProcessPayload) {
    return mergeStreamOutput(lastProcessPayload, accumulatedOutput);
  }

  return createStreamFallbackResponse(accumulatedOutput);
}

function isStreamContentType(contentType: string) {
  return (
    contentType.includes('text/event-stream') ||
    contentType.includes('application/x-ndjson') ||
    contentType.includes('application/jsonl') ||
    contentType.includes('text/plain') ||
    contentType.includes('text/markdown')
  );
}

function getSseFrameData(frame: string) {
  const dataLines = frame
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).replace(/^ /, ''));

  return dataLines.join('\n');
}

async function parseStreamResponse(
  response: Response,
  options: ProcessRequestOptions = {},
) {
  const reader = response.body?.getReader();

  if (!reader) {
    return parseResponse(response) as Promise<ProcessResponse | null>;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isSse = contentType.includes('text/event-stream');
  const isJsonLines =
    contentType.includes('application/x-ndjson') || contentType.includes('application/jsonl');
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulatedOutput = '';
  let lastProcessPayload: ProcessResponse | null = null;

  function emitDelta(delta: string) {
    if (!delta) {
      return;
    }

    accumulatedOutput += delta;
    options.onOutputDelta?.(delta);
  }

  function handlePayload(payload: unknown) {
    if (isProcessResponsePayload(payload)) {
      lastProcessPayload = payload;
    }

    const delta = getStreamDelta(payload);

    if (delta) {
      emitDelta(delta);
    }
  }

  function handleTextPayload(value: string) {
    const trimmed = value.trim();

    if (!trimmed || STREAM_DONE_MESSAGES.has(trimmed)) {
      return;
    }

    const parsed = tryParseJson(trimmed);

    if (parsed !== undefined) {
      handlePayload(parsed);
      return;
    }

    emitDelta(value);
  }

  function consumeSseBuffer() {
    let boundaryIndex = buffer.indexOf('\n\n');

    while (boundaryIndex >= 0) {
      const frame = buffer.slice(0, boundaryIndex);
      buffer = buffer.slice(boundaryIndex + 2);
      handleTextPayload(getSseFrameData(frame));
      boundaryIndex = buffer.indexOf('\n\n');
    }
  }

  function consumeJsonLinesBuffer() {
    let boundaryIndex = buffer.indexOf('\n');

    while (boundaryIndex >= 0) {
      const line = buffer.slice(0, boundaryIndex);
      buffer = buffer.slice(boundaryIndex + 1);
      handleTextPayload(line);
      boundaryIndex = buffer.indexOf('\n');
    }
  }

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    const chunk = decoder.decode(value, { stream: true });

    if (isSse || isJsonLines) {
      buffer += chunk.replace(/\r\n/g, '\n');

      if (isSse) {
        consumeSseBuffer();
      } else {
        consumeJsonLinesBuffer();
      }

      continue;
    }

    emitDelta(chunk);
  }

  const rest = decoder.decode();

  if (rest) {
    if (isSse || isJsonLines) {
      buffer += rest.replace(/\r\n/g, '\n');
    } else {
      emitDelta(rest);
    }
  }

  if ((isSse || isJsonLines) && buffer.trim()) {
    if (isSse) {
      handleTextPayload(getSseFrameData(buffer));
    } else {
      handleTextPayload(buffer);
    }
  }

  return normalizeStreamResponse(lastProcessPayload, accumulatedOutput);
}

async function parseProcessResponse(
  response: Response,
  options: ProcessRequestOptions = {},
) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json() as Promise<ProcessResponse | null>;
  }

  if (response.body && (options.onOutputDelta || isStreamContentType(contentType))) {
    return parseStreamResponse(response, options);
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  const parsed = tryParseJson(text);
  return parsed && isRecord(parsed) ? (parsed as ProcessResponse) : { message: text };
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

function shouldTryNextProcessEndpoint(status: number) {
  return status === 404 || status === 405;
}

async function requestProcessFromBaseUrl(
  baseUrl: string,
  payload: ProcessRequestPayload,
  options: ProcessRequestOptions = {},
) {
  const response = await fetch(joinUrl(baseUrl, '/process'), {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream, application/x-ndjson, application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const parsed =
    !response.ok && response.status !== 207
      ? ((await parseResponse(response)) as ProcessResponse | null)
      : await parseProcessResponse(response, options);

  return { parsed, response };
}

async function requestProcess(
  payload: ProcessRequestPayload,
  options: ProcessRequestOptions = {},
) {
  let lastParsed: ProcessResponse | null = null;
  let lastStatus = 0;

  for (const [index, baseUrl] of PROCESS_API_BASE_URLS.entries()) {
    const { parsed, response } = await requestProcessFromBaseUrl(baseUrl, payload, options);
    lastParsed = parsed;
    lastStatus = response.status;

    if (
      !response.ok &&
      response.status !== 207 &&
      shouldTryNextProcessEndpoint(response.status) &&
      index < PROCESS_API_BASE_URLS.length - 1
    ) {
      continue;
    }

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

  throw new ApiError(getErrorMessage(lastParsed, lastStatus), lastStatus);
}

export const chatApi = {
  async appendMessage(
    sessionId: string,
    payload: AppendMessagePayload,
    requestOptions: ProcessRequestOptions = {},
  ) {
    const currentSession = findSession(sessionId);

    if (!currentSession) {
      throw new ApiError('会话不存在', 404);
    }

    const now = Date.now();
    const options = normalizeMatchOptions(payload.options ?? currentSession.options);
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
        options,
        requirement: getInitialRequirement(currentSession, payload.prompt),
        sessionId,
      }),
      requestOptions,
    );
    const assistantMessage = createAssistantMessage(
      response,
      options.showReasoning,
    );
    const session: ChatSession = {
      ...currentSession,
      options,
      messages: [...currentSession.messages, userMessage, assistantMessage],
      updatedAt: now,
    };

    saveSession(session);

    return {
      session,
      recommendationPanel: buildRecommendationPanel(session, response),
    } satisfies SessionDetailResponse;
  },
  async createSession(
    payload: CreateSessionPayload,
    requestOptions: ProcessRequestOptions = {},
  ) {
    const options = normalizeMatchOptions(payload.options);
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
        options,
        requirement: payload.prompt,
        sessionId,
      }),
      requestOptions,
    );
    const assistantMessage = createAssistantMessage(response, options.showReasoning);
    const session: ChatSession = {
      id: sessionId,
      title: createSessionTitle(payload.prompt),
      modeId: payload.modeId,
      modeLabel,
      options,
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
    let lastPayload: unknown = null;
    let lastStatus = 0;

    for (const [index, baseUrl] of PROCESS_API_BASE_URLS.entries()) {
      const response = await fetch(joinUrl(baseUrl, '/config'), {
        headers: {
          Accept: 'application/json',
        },
      });
      const payload = await parseResponse(response);
      lastPayload = payload;
      lastStatus = response.status;

      if (
        !response.ok &&
        shouldTryNextProcessEndpoint(response.status) &&
        index < PROCESS_API_BASE_URLS.length - 1
      ) {
        continue;
      }

      if (!response.ok) {
        throw new ApiError(getErrorMessage(payload, response.status), response.status);
      }

      return payload;
    }

    throw new ApiError(getErrorMessage(lastPayload, lastStatus), lastStatus);
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
