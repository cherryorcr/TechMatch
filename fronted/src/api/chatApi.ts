import type {
  AppendMessagePayload,
  CreateSessionPayload,
  SessionDetailResponse,
  SessionListResponse,
} from '../types/chat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface ApiErrorPayload {
  message?: string;
}

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

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(joinUrl(API_BASE_URL, path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload, response.status), response.status);
  }

  return payload as T;
}

export const chatApi = {
  appendMessage(sessionId: string, payload: AppendMessagePayload) {
    return request<SessionDetailResponse>(`/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  createSession(payload: CreateSessionPayload) {
    return request<SessionDetailResponse>('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getSession(sessionId: string) {
    return request<SessionDetailResponse>(`/chat/sessions/${sessionId}`);
  },
  listSessions() {
    return request<SessionListResponse>('/chat/sessions');
  },
};
