
import React, { useState, useRef, useEffect } from 'react';
import { PipelineResult, Language, AuthState } from '../types';
import { Video, Sparkles, Tag, Image as ImageIcon, Scissors, Play, Volume2, Mic, Smartphone, HardDrive, Download, Check, Share2, MessageSquare } from 'lucide-react';
import { TRANSLATIONS } from '../translations';
import Tooltip from './Tooltip';
import CommentAutomation from './CommentAutomation';

interface ResultViewProps {
  result: PipelineResult;
  onReset: () => void;
  onRunStageB: () => void;
  onRunStageC: () => void;
  isStageBRunning: boolean;
  isStageCRunning: boolean;
  lang: Language;
  auth: AuthState;
  onLoginRequest: () => void;
}

const CopyButton: React.FC<{ text: string; label: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy}
      className="text-xs bg-dark-800 hover:bg-dark-700 border border-gray-700 px-2 py-1 rounded text-gray-300 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : label}
    </button>
  );
};

const SynthesizedPlayer: React.FC<{ 
    videoUrl: string, 
    localFileUrl?: string,
    script: string, 
    subtitles: any[],
    lang: Language,
    startTime?: number,
    endTime?: number
}> = ({ videoUrl, localFileUrl, script, subtitles, lang, startTime = 0, endTime = 10 }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSubtitleText, setCurrentSubtitleText] = useState("");
    const videoRef = useRef<HTMLVideoElement>(null);
    const [downloading, setDownloading] = useState(false);
    
    // Handle Video Loop & Subtitle Sync
    useEffect(() => {
        const vid = videoRef.current;
        if (!vid || !localFileUrl) {
            // For cloud/iframe mode, we simulate subtitles with a timer if playing
            if (isPlaying && !localFileUrl) {
                let start = Date.now();
                const duration = (endTime - startTime) * 1000;
                const interval = setInterval(() => {
                    const elapsed = (Date.now() - start) / 1000;
                    if (elapsed > (endTime - startTime)) {
                         start = Date.now(); // Loop
                    }
                    const activeSub = subtitles.find(s => elapsed >= s.start && elapsed <= s.end);
                    setCurrentSubtitleText(activeSub ? activeSub.text : subtitles[0]?.text || "");
                }, 100);
                return () => clearInterval(interval);
            }
            return;
        }

        const handleTimeUpdate = () => {
            // Loop logic
            if (vid.currentTime >= endTime) {
                vid.currentTime = startTime;
                // Keep playing if state is playing
                if (isPlaying) {
                    vid.play().catch(() => {});
                } else {
                    vid.pause();
                }
            }
            
            // Subtitle Sync Logic
            const relativeTime = Math.max(0, vid.currentTime - startTime);
            const activeSub = subtitles.find(s => relativeTime >= s.start && relativeTime <= s.end);
            
            if (activeSub) {
                setCurrentSubtitleText(activeSub.text);
            } else if (relativeTime < 0.5) {
                 setCurrentSubtitleText(subtitles[0]?.text || "");
            }
        };
        
        if (!isPlaying) {
            vid.currentTime = startTime;
            setCurrentSubtitleText(subtitles[0]?.text || "");
        }

        vid.addEventListener('timeupdate', handleTimeUpdate);
        return () => vid.removeEventListener('timeupdate', handleTimeUpdate);
    }, [localFileUrl, startTime, endTime, subtitles, isPlaying]);

    const handlePlayPreview = () => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            if(videoRef.current) videoRef.current.pause();
        } else {
            const utterance = new SpeechSynthesisUtterance(script);
            utterance.lang = lang === 'ko' ? 'ko-KR' : 'en-US';
            utterance.rate = 1.1;
            utterance.pitch = 1.0;
            
            utterance.onend = () => {
                setIsPlaying(false);
                if(videoRef.current) videoRef.current.pause();
            };
            
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
            
            if(videoRef.current) {
                videoRef.current.currentTime = startTime;
                videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
            }
        }
    };

    const handleDownload = () => {
        setDownloading(true);
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = localFileUrl || videoUrl; 
            link.download = `AI_Shorts_${new Date().getTime()}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setDownloading(false);
        }, 1500);
    };

    return (
        <div className="space-y-6 flex flex-col items-center w-full">
            {/* PHONE CONTAINER */}
            <div className="relative bg-black rounded-[2.5rem] overflow-hidden aspect-[9/16] w-full max-w-[340px] shadow-2xl border-[8px] border-gray-900 ring-1 ring-gray-800 flex flex-col">
                <div className="absolute inset-0 bg-black">
                    {localFileUrl ? (
                        <video 
                            ref={videoRef}
                            src={localFileUrl}
                            className="w-full h-full object-cover scale-105"
                            muted
                            playsInline
                        />
                    ) : (
                        <iframe 
                            src={videoUrl} 
                            title="Preview"
                            className="w-full h-full object-cover"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                    )}
                </div>
                
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between pb-24 px-6 pt-14 z-10">
                     <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/90 via-black/40 to-transparent" />
                     <div className="relative flex justify-between items-start">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10">
                            AI SHORTS
                        </span>
                        {localFileUrl && (
                             <span className="bg-brand-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                                <HardDrive className="w-3 h-3" /> HD
                            </span>
                        )}
                     </div>
                     <div className="relative flex flex-col items-center gap-4">
                        <div 
                            className={`
                                text-white text-center px-4 py-2 rounded-xl font-black text-xl leading-snug 
                                drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] 
                                transition-all duration-200 transform
                                ${currentSubtitleText ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
                            `}
                            style={{ 
                                textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
                                background: 'rgba(0,0,0,0.3)',
                                backdropFilter: 'blur(2px)'
                            }}
                        >
                            {currentSubtitleText || "..."}
                        </div>
                     </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

                <div className="absolute bottom-8 right-6 z-20 pointer-events-auto">
                    <button 
                        onClick={handlePlayPreview}
                        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-xl border border-white/10 transition-all transform hover:scale-110 active:scale-95 ${
                            isPlaying ? 'bg-white text-black' : 'bg-brand-600 text-white'
                        }`}
                    >
                        {isPlaying ? <Volume2 className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                    </button>
                </div>
            </div>

            {/* DOWNLOAD ACTIONS */}
            <div className="w-full max-w-[340px] grid grid-cols-2 gap-3">
                <button 
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-900/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {downloading ? (
                        <><Smartphone className="w-4 h-4 animate-bounce" /> {lang === 'ko' ? "저장 중..." : "Saving..."}</>
                    ) : (
                        <><Download className="w-4 h-4" /> {lang === 'ko' ? "영상 다운로드" : "Download Video"}</>
                    )}
                </button>
                <button className="bg-dark-700 hover:bg-dark-600 text-gray-200 py-3 rounded-xl font-medium border border-gray-600 flex items-center justify-center gap-2 transition-all active:scale-95">
                    <Share2 className="w-4 h-4" /> {lang === 'ko' ? "공유" : "Share"}
                </button>
            </div>

            <div className="w-full max-w-[360px] bg-dark-950 p-5 rounded-xl border border-gray-800 shadow-lg relative mt-4">
                <div className="absolute -top-3 left-4 bg-dark-800 px-2 py-1 rounded border border-gray-700 flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
                    <Mic className="w-3 h-3" />
                    {lang === 'ko' ? "AI 성우 대본" : "AI Voice Script"}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed italic mt-1">
                    "{script}"
                </p>
            </div>
        </div>
    );
};

const ResultView: React.FC<ResultViewProps> = ({ 
  result, 
  onReset, 
  onRunStageB,
  onRunStageC,
  isStageBRunning,
  lang,
  auth,
  onLoginRequest
}) => {
  const { metadata, stageB, stageC } = result;
  const t = (key: keyof typeof TRANSLATIONS['en']) => TRANSLATIONS[lang][key];

  return (
    <div className="bg-dark-800 rounded-xl border border-gray-700 p-6 shadow-xl space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-white">
            {stageC ? (lang === 'ko' ? "커뮤니티 자동화" : "Community Automation") : stageB ? t('stageB_complete') : t('stageA_complete')}
          </h2>
          <p className="text-brand-500 text-sm">
             {stageC ? (lang === 'ko' ? "AI가 댓글을 분석하고 답글을 제안합니다." : "AI analyzing comments and drafting replies.") : stageB ? t('stageB_sub') : t('stageA_sub')}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onReset} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 border border-gray-700">
            {t('newProject')}
          </button>
          {!stageB && (
            <button
              onClick={onRunStageB}
              disabled={isStageBRunning}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 rounded-lg text-sm text-white flex items-center gap-2 shadow-lg shadow-purple-900/20"
            >
              {isStageBRunning ? t('processingStageB') : <><Sparkles className="w-4 h-4" /> {t('runStageB')}</>}
            </button>
          )}
        </div>
      </div>

      {stageC && stageC.comments ? (
          <CommentAutomation 
            comments={stageC.comments} 
            lang={lang} 
            isAuthenticated={auth.isAuthenticated}
            onLoginRequest={onLoginRequest}
            accessToken={auth.accessToken} 
          />
      ) : stageB ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in">
            {/* Left: Synthesized Player (Vertical) */}
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-6 text-purple-400 self-start lg:self-center w-full max-w-[320px]">
                    <Smartphone className="w-5 h-5" />
                    <h3 className="font-semibold uppercase tracking-wide">{t('generatedVideoTitle')}</h3>
                </div>
                <SynthesizedPlayer 
                    videoUrl={stageB.generatedVideoUrl}
                    localFileUrl={result.localFileUrl}
                    script={stageB.generatedScript}
                    subtitles={stageB.overlaySubtitles}
                    lang={lang}
                    startTime={stageB.highlights[0]?.start || 0}
                    endTime={stageB.highlights[0]?.end || 10}
                />
            </div>

            {/* Right: Metadata & Assets */}
            <div className="space-y-6 pt-2">
                {/* Engagement Automation CTA */}
                <div className="bg-brand-900/20 p-5 rounded-xl border border-brand-500/30 shadow-inner">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-brand-400 text-sm font-semibold uppercase">
                            <MessageSquare className="w-4 h-4" />
                            {lang === 'ko' ? "댓글 자동화" : "Auto-Replies"}
                        </div>
                        <button 
                            onClick={onRunStageC}
                            className="bg-brand-600 hover:bg-brand-500 text-white text-xs px-3 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                        >
                            {lang === 'ko' ? "댓글 관리 시작" : "Manage Comments"}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        {lang === 'ko' ? "업로드 후 달리는 댓글을 AI가 분석하여 자동으로 답글을 생성합니다." : "AI monitors comments after upload and drafts engaging replies automatically."}
                    </p>
                </div>

                {/* Thumbnail */}
                <div className="bg-dark-950 p-5 rounded-xl border border-gray-800 shadow-inner">
                    <div className="flex items-center gap-2 mb-3 text-green-400 text-sm font-semibold uppercase">
                        <ImageIcon className="w-4 h-4" />
                        {t('aiThumbnail')}
                    </div>
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden group shadow-lg">
                         <img src={stageB.thumbnails[0]} alt="Thumb" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <h3 className="text-2xl md:text-3xl font-black text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center px-4 transform -rotate-2">
                                {stageB.seo.thumbnailText}
                            </h3>
                         </div>
                    </div>
                </div>

                {/* SEO Data */}
                <div className="bg-dark-950 p-5 rounded-xl border border-gray-800 space-y-5 shadow-inner">
                    <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold uppercase">
                        <Tag className="w-4 h-4" />
                        {t('optimizedMetadata')}
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t('lbl_title')}</span>
                            <CopyButton text={stageB.seo.title} label={t('action_copy')} />
                        </div>
                        <p className="text-sm text-white font-medium bg-dark-900 p-3 rounded border border-gray-800">
                            {stageB.seo.title}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        // Stage A View
        <div className="bg-dark-950 p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-6 items-start">
            {metadata && (
                <div className="relative shrink-0 w-full md:w-64 aspect-video rounded-lg overflow-hidden shadow-lg border border-gray-800">
                    <img src={metadata.thumbnailUrl} className="w-full h-full object-cover" alt="Source" />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                        {metadata.duration}
                    </div>
                </div>
            )}
            <div className="flex-1 space-y-3">
                <div>
                    <h3 className="text-xl text-white font-bold mb-1 line-clamp-2">{metadata?.title}</h3>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-brand-500 rounded-full inline-block" />
                        {metadata?.channelTitle}
                    </p>
                </div>
                <div className="h-px bg-gray-800 w-full my-2" />
                <div className="flex items-center gap-2 text-brand-500 text-sm pt-2 animate-pulse">
                    <Scissors className="w-4 h-4" />
                    <span>{lang === 'ko' ? "하이라이트 분석 준비 완료..." : "Ready to analyze highlights..."}</span>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ResultView;
