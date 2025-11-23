
import { GoogleGenAI, Type } from "@google/genai";
import { VideoMetadata, SubtitleItem, HighlightSegment, SeoData, Language, Comment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

// Helper to extract Video ID reliably
const extractVideoId = (url: string): string => {
    try {
        const urlObj = new URL(url);
        let id = urlObj.searchParams.get("v");
        if (!id) {
             if (urlObj.hostname.includes("youtu.be")) {
                id = urlObj.pathname.slice(1);
             } else if (urlObj.pathname.includes("/shorts/")) {
                id = urlObj.pathname.split("/shorts/")[1];
             }
        }
        return id || "dQw4w9WgXcQ";
    } catch (e) {
        return "dQw4w9WgXcQ";
    }
};

export const fetchMockMetadata = async (url: string, lang: Language = 'en'): Promise<VideoMetadata> => {
  const videoId = extractVideoId(url);
  
  try {
    const langPrompt = lang === 'ko' ? 'Generate Korean content.' : 'Generate English content.';
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `You are a metadata extractor. Generate a JSON object for the YouTube video ID: ${videoId}.
      Assume the URL is valid. Invent a plausible Title, Description, and Channel Name based on the ID or general tech/viral trends if unknown.
      ${langPrompt}
      Return ONLY JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            duration: { type: Type.STRING },
            thumbnailUrl: { type: Type.STRING },
            channelTitle: { type: Type.STRING },
            viewCount: { type: Type.STRING },
          },
          required: ["id", "title", "description", "duration", "channelTitle", "viewCount"]
        }
      }
    });

    if (response.text) {
        const data = JSON.parse(response.text);
        data.id = videoId; // Enforce ID
        data.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        return data as VideoMetadata;
    }
    throw new Error("No response");
  } catch (error) {
    console.error("Metadata Error", error);
    return {
      id: videoId,
      title: "Video Title Not Found",
      description: "Description unavailable.",
      duration: "10:00",
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      channelTitle: "Unknown Channel",
      viewCount: "0"
    };
  }
};

export const generateMockTranscript = async (title: string, lang: Language = 'en'): Promise<SubtitleItem[]> => {
  try {
    const langPrompt = lang === 'ko' ? 'Korean text' : 'English text';
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a simulated subtitle transcript for a video titled "${title}". 
      Create about 15-20 lines of dialogue/monologue.
      Format: JSON Array of {start, end, text}.
      Language: ${langPrompt}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    start: { type: Type.NUMBER },
                    end: { type: Type.NUMBER },
                    text: { type: Type.STRING }
                },
                required: ["start", "end", "text"]
            }
        }
      }
    });
    return response.text ? JSON.parse(response.text) : [];
  } catch (e) {
    return Array.from({length: 5}, (_, i) => ({
        start: i * 5,
        end: (i * 5) + 4,
        text: lang === 'ko' ? `자막 테스트 라인 ${i+1}` : `Subtitle test line ${i+1}`
    }));
  }
};

export const generateHighlights = async (subtitles: SubtitleItem[], clipLength: string, style: string, lang: Language = 'en'): Promise<HighlightSegment[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze these subtitles. Find ONE contiguous segment suitable for a ${clipLength} viral video.
      IMPORTANT: The start time MUST be within the first 60 seconds of the video to ensure preview availability.
      Style: ${style}.
      Subtitles: ${JSON.stringify(subtitles)}.
      Return JSON Array with 1 item: {start, end, reason}.
      Language: ${lang === 'ko' ? 'Korean' : 'English'}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    start: { type: Type.NUMBER },
                    end: { type: Type.NUMBER },
                    reason: { type: Type.STRING }
                },
                required: ["start", "end", "reason"]
            }
        }
      }
    });
    return response.text ? JSON.parse(response.text) : [{ start: 0, end: 30, reason: "Default start" }];
  } catch (e) {
    return [{ start: 0, end: 30, reason: "Fallback" }];
  }
};

export const generateVoiceScript = async (highlight: HighlightSegment, subtitles: SubtitleItem[], style: string, lang: Language = 'en'): Promise<string> => {
    const relevantText = subtitles
        .filter(s => s.start >= highlight.start && s.end <= highlight.end)
        .map(s => s.text)
        .join(" ");

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Based on this transcript segment: "${relevantText}" and the reason for selection "${highlight.reason}".
            Write a short, engaging narrator script (max 3 sentences) that summarizes or reacts to this clip.
            Style: ${style}.
            Language: ${lang === 'ko' ? 'Korean' : 'English'}.
            Output strictly the text to be spoken.`,
        });
        return response.text || (lang === 'ko' ? "이 장면은 정말 놀랍습니다. 확인해보세요!" : "This scene is amazing. Check it out!");
    } catch (e) {
        return "";
    }
};

export const generateOverlaySubtitles = async (script: string, duration: number): Promise<SubtitleItem[]> => {
    const words = script.split(' ');
    const chunks = [];
    let chunk = [];
    
    for (const word of words) {
        chunk.push(word);
        if (chunk.length >= 5) {
            chunks.push(chunk.join(' '));
            chunk = [];
        }
    }
    if (chunk.length > 0) chunks.push(chunk.join(' '));

    const step = duration / chunks.length;
    return chunks.map((text, i) => ({
        start: i * step,
        end: (i + 1) * step,
        text
    }));
};

export const generateEditedClip = async (videoId: string, highlights: HighlightSegment[], style: string): Promise<string> => {
  const start = Math.floor(highlights[0].start);
  const end = Math.ceil(highlights[0].end);
  return `https://www.youtube.com/embed/${videoId}?start=${start}&end=${end}&autoplay=1&mute=1&rel=0&modestbranding=1&controls=0&loop=1&playlist=${videoId}`;
};

export const generateThumbnail = async (metadata: VideoMetadata): Promise<string> => {
  return metadata.thumbnailUrl;
};

export const generateShoppingSummary = async (links: string, lang: Language = 'en'): Promise<string> => {
   return ""; 
};

export const generateSeoData = async (
  metadata: VideoMetadata, 
  script: string, 
  style: string,
  lang: Language = 'en'
): Promise<SeoData> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate YouTube Shorts metadata based on this script: "${script}".
      Style: ${style}.
      Original Title: "${metadata.title}".
      Language: ${lang === 'ko' ? 'Korean' : 'English'}.
      Return JSON: title, description, tags, commentText, metaKeywords, thumbnailText (max 3 words).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            commentText: { type: Type.STRING },
            metaKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            thumbnailText: { type: Type.STRING }
          },
          required: ["title", "description", "tags", "commentText", "metaKeywords", "thumbnailText"]
        }
      }
    });
    if (response.text) return JSON.parse(response.text);
    throw new Error();
  } catch (error) {
    return {
      title: "Check this out!",
      description: "Amazing clip.",
      tags: ["shorts"],
      commentText: "Wow!",
      metaKeywords: ["video"],
      thumbnailText: "WOW"
    };
  }
};

// === NEW: Comment Automation ===

export const generateMockComments = async (title: string, lang: Language = 'en'): Promise<Comment[]> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Generate 5 YouTube user comments for a video titled "${title}".
            Mix positive, neutral, and question types.
            Language: ${lang === 'ko' ? 'Korean' : 'English'}.
            Return JSON Array of objects with: author, text, likes (number), sentiment (positive/neutral/negative).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            author: { type: Type.STRING },
                            text: { type: Type.STRING },
                            likes: { type: Type.INTEGER },
                            sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative"] }
                        },
                        required: ["author", "text", "likes", "sentiment"]
                    }
                }
            }
        });
        
        const rawComments = response.text ? JSON.parse(response.text) : [];
        return rawComments.map((c: any, i: number) => ({
            id: `cm_${i}`,
            ...c,
            avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${c.author}`,
            timestamp: `${Math.floor(Math.random() * 10) + 1}h ago`,
            isReplied: false
        }));

    } catch(e) {
        return [];
    }
};

export const generateAICommentReply = async (comment: string, sentiment: string, lang: Language = 'en'): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `You are a friendly YouTube creator. Write a short, engaging reply to this user comment: "${comment}".
            Sentiment of comment: ${sentiment}.
            Language: ${lang === 'ko' ? 'Korean' : 'English'}.
            Keep it under 1 sentence. Add an emoji.`,
        });
        return response.text || (lang === 'ko' ? "감사합니다! 🔥" : "Thanks for watching! 🔥");
    } catch (e) {
        return "Thanks!";
    }
};
