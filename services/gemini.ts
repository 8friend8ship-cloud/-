import { VideoMetadata, SubtitleItem, HighlightSegment, SeoData, Language, Comment } from '../types';

export const RUNTIME_NOT_CONNECTED = 'RUNTIME_NOT_CONNECTED';

const unavailable = (): never => {
  throw new Error(RUNTIME_NOT_CONNECTED);
};

export const fetchMockMetadata = async (_url: string, _lang: Language = 'en'): Promise<VideoMetadata> => unavailable();
export const generateMockTranscript = async (_title: string, _lang: Language = 'en'): Promise<SubtitleItem[]> => unavailable();
export const generateHighlights = async (_subtitles: SubtitleItem[], _clipLength: string, _style: string, _lang: Language = 'en'): Promise<HighlightSegment[]> => unavailable();
export const generateVoiceScript = async (_highlight: HighlightSegment, _subtitles: SubtitleItem[], _style: string, _lang: Language = 'en'): Promise<string> => unavailable();
export const generateSeoData = async (_metadata: VideoMetadata, _script: string, _style: string, _lang: Language = 'en'): Promise<SeoData> => unavailable();
export const generateMockComments = async (_title: string, _lang: Language = 'en'): Promise<Comment[]> => unavailable();
export const generateAICommentReply = async (_comment: string, _sentiment: string, _lang: Language = 'en'): Promise<string> => unavailable();
export const generateEditedClip = async (_videoId: string, _highlights: HighlightSegment[], _style: string): Promise<string> => unavailable();

export const generateThumbnail = async (metadata: VideoMetadata): Promise<string> => {
  if (!metadata?.thumbnailUrl) unavailable();
  return metadata.thumbnailUrl;
};

export const generateOverlaySubtitles = async (script: string, duration: number): Promise<SubtitleItem[]> => {
  if (!script || !Number.isFinite(duration) || duration <= 0) unavailable();
  const words = script.trim().split(/\s+/).filter(Boolean);
  if (!words.length) unavailable();
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += 5) chunks.push(words.slice(i, i + 5).join(' '));
  const step = duration / chunks.length;
  return chunks.map((text, index) => ({ start: index * step, end: (index + 1) * step, text }));
};

export const generateShoppingSummary = async (_links: string, _lang: Language = 'en'): Promise<string> => unavailable();
