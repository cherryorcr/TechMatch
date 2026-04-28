export type HomeModeId =
  | 'internal-industry'
  | 'external-expert'
  | 'academic'
  | 'deep-search'
  | 'tech-recommendation';

export interface MatchOptions {
  paperCount: number;
  showReasoning: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  meta: string;
  attachments?: ChatAttachment[];
  reasoning?: string;
  status?: 'sending' | 'failed';
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: number;
}

export type ChatAttachment = UploadedFile;

export interface ChatSession {
  id: string;
  title: string;
  modeId: HomeModeId;
  modeLabel: string;
  options: MatchOptions;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatSessionSummary {
  id: string;
  modeId: HomeModeId;
  modeLabel: string;
  title: string;
  latestMessage: string;
  updatedAt: number;
  options: MatchOptions;
}

export interface SessionRecord {
  id: string;
  modeId: HomeModeId;
  modeLabel: string;
  title: string;
  summary: string;
  timestamp: string;
  prompt: string;
}

export interface SuggestionCard {
  id: string;
  title: string;
  prompt: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  meta: string;
  detail: string;
  keywords?: string[];
}

export interface RecommendationBundle {
  scholars: RecommendationItem[];
  papers: RecommendationItem[];
  institutions: RecommendationItem[];
  directions: string[];
}

export interface HomePreviewSection {
  id: string;
  title: string;
  items: string[];
}

export interface HomeModeConfig {
  id: HomeModeId;
  label: string;
  title: string;
  subtitle: string;
  placeholder: string;
  inputHint: string;
  suggestions: SuggestionCard[];
  previewSections: HomePreviewSection[];
  recommendations: RecommendationBundle;
}

export interface ContextualRecommendationState {
  stage: 'clarifying' | 'matching';
  heading: string;
  summary: string;
  signals: string[];
  nextQuestions: string[];
  recommendations: RecommendationBundle;
}

export interface CreateSessionPayload {
  fileIds?: string[];
  modeId: HomeModeId;
  options: MatchOptions;
  prompt: string;
}

export interface AppendMessagePayload {
  fileIds?: string[];
  prompt: string;
}

export interface UploadFilesResponse {
  files: UploadedFile[];
}

export interface SessionDetailResponse {
  session: ChatSession;
  recommendationPanel: ContextualRecommendationState;
}

export interface SessionListResponse {
  sessions: ChatSessionSummary[];
}
