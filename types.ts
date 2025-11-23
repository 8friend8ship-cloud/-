
export type Language = 'en' | 'ko';

export enum PipelineStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum StepStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  SKIPPED = 'SKIPPED'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  reply?: string; // The AI reply
  isReplied: boolean;
}

export interface UserInput {
  youtubeUrl: string;
  clipLength: string;
  clipStyle: string;
  shoppingLinks: string;
  voiceStyle: string;
  titleStyle: string;
  sourceFile: File | null; // New: Manual upload support
}

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
  channelTitle: string;
  viewCount: string;
}

export interface SubtitleItem {
  start: number;
  end: number;
  text: string;
}

export interface HighlightSegment {
  start: number;
  end: number;
  reason: string;
}

export interface SeoData {
  title: string;
  description: string;
  tags: string[];
  commentText: string;
  metaKeywords: string[];
  thumbnailText: string;
}

export interface StageBResult {
  highlights: HighlightSegment[];
  thumbnails: string[]; // url
  productSummaries: string[];
  seo: SeoData;
  generatedVideoUrl: string; // YouTube Embed URL with start/end
  generatedScript: string; // The new AI narrator script
  overlaySubtitles: SubtitleItem[]; // Subtitles for the NEW script
}

export interface StageCResult {
  comments: Comment[];
  autoReplyStats: {
    total: number;
    replied: number;
  }
}

export interface PipelineResult {
  metadata: VideoMetadata | null;
  subtitles: SubtitleItem[];
  videoPath: string; 
  localFileUrl?: string; // New: Blob URL for local playback
  stageB?: StageBResult;
  stageC?: StageCResult;
}

export interface PipelineStep {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
  logs: string[];
}

export const DEFAULT_INPUT: UserInput = {
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  clipLength: '60s',
  clipStyle: 'meme',
  shoppingLinks: '',
  voiceStyle: 'Energetic',
  titleStyle: 'Bold Overlay',
  sourceFile: null
};
