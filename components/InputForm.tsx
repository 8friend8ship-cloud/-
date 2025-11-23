
import React, { useRef, useEffect, useState } from 'react';
import { UserInput, Language } from '../types';
import { Link, Sparkles, Upload, Download, FileVideo, Loader2, Clipboard, Youtube, X, ArrowRight, Play } from 'lucide-react';
import { TRANSLATIONS } from '../translations';
import Tooltip from './Tooltip';
import { AuthService } from '../services/auth';

interface InputFormProps {
  input: UserInput;
  onChange: (input: UserInput) => void;
  disabled: boolean;
  onSubmit: () => void;
  lang: Language;
  onLoadSample: () => void;
  isLoadingSample: boolean;
  onImportLiked: () => void;
  isAuthenticated: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ 
    input, 
    onChange, 
    disabled, 
    onSubmit, 
    lang, 
    onLoadSample, 
    isLoadingSample,
    isAuthenticated
}) => {
  const t = (key: keyof typeof TRANSLATIONS['en']) => TRANSLATIONS[lang][key];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [suggestedVideo, setSuggestedVideo] = useState<{title: string, url: string} | null>(null);
  const [clipboardDetected, setClipboardDetected] = useState<string | null>(null);

  const handleChange = (field: keyof UserInput, value: any) => {
    onChange({ ...input, [field]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        handleChange('sourceFile', e.target.files[0]);
    }
  };

  const handlePaste = async () => {
      try {
          const text = await navigator.clipboard.readText();
          if (text && (text.includes('youtube.com') || text.includes('youtu.be'))) {
              handleChange('youtubeUrl', text);
              setClipboardDetected(null);
          }
      } catch (err) {
          console.error('Failed to read clipboard');
      }
  };

  const handleQuickPick = () => {
      if (suggestedVideo) {
          handleChange('youtubeUrl', suggestedVideo.url);
          setSuggestedVideo(null); // Hide suggestion once picked
      }
  };

  // Smart Feature 1: Auto-detect clipboard on mount/focus
  useEffect(() => {
      const checkClipboard = async () => {
          if (input.youtubeUrl) return;
          try {
              const text = await navigator.clipboard.readText();
              if (text && (text.includes('youtube.com') || text.includes('youtu.be'))) {
                  setClipboardDetected(text);
              }
          } catch (e) { /* Silent fail */ }
      };
      window.addEventListener('focus', checkClipboard);
      return () => window.removeEventListener('focus', checkClipboard);
  }, [input.youtubeUrl]);

  // Smart Feature 2: Fetch latest video for "Quick Pick" if logged in
  useEffect(() => {
      if (isAuthenticated && !input.youtubeUrl) {
          AuthService.fetchUserLikedVideos().then(videos => {
              if (videos.length > 0) setSuggestedVideo(videos[0]);
          });
      }
  }, [isAuthenticated, input.youtubeUrl]);

  return (
    <div className="bg-dark-800 rounded-xl border border-gray-700 p-6 shadow-xl relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-6 text-brand-500 relative z-10">
        <Sparkles className="w-5 h-5" />
        <h2 className="text-lg font-semibold tracking-wide uppercase">{t('configTitle')}</h2>
      </div>

      <div className="space-y-8 relative z-10">
        
        {/* === UNIFIED SMART INPUT HUB === */}
        <div className="space-y-4">
            <label className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                {lang === 'ko' ? "1단계: 영상 선택 (소스)" : "Step 1: Select Source Video"}
                {isAuthenticated && !input.youtubeUrl && (
                    <span className="text-[10px] text-green-400 flex items-center gap-1 bg-green-900/20 px-2 py-0.5 rounded-full animate-pulse">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        YouTube Connected
                    </span>
                )}
            </label>

            {/* STATE A: URL ALREADY ENTERED */}
            {input.youtubeUrl ? (
                <div className="bg-dark-950 rounded-xl border border-brand-500/50 p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 text-brand-400 overflow-hidden">
                            <div className="p-2 bg-brand-900/20 rounded-lg shrink-0">
                                <Youtube className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs text-gray-500 font-mono uppercase">Target Source</span>
                                <span className="text-sm font-medium truncate text-white">{input.youtubeUrl}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleChange('youtubeUrl', '')}
                            className="p-1.5 hover:bg-red-900/20 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {/* Action Bar for URL */}
                    <div className="flex gap-2 mt-1">
                        <button
                            onClick={onLoadSample}
                            disabled={disabled || isLoadingSample}
                            className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-900/20 active:scale-[0.98]"
                        >
                            {isLoadingSample ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {lang === 'ko' ? "이 영상 가져오기" : "Fetch This Video"}
                        </button>
                    </div>
                </div>
            ) : (
                /* STATE B: EMPTY STATE - "SMART OPTIONS" */
                <div className="grid grid-cols-1 gap-3">
                    
                    {/* Option 1: Quick Pick (If Logged In) */}
                    {isAuthenticated && suggestedVideo && (
                        <div className="bg-gradient-to-r from-red-900/20 to-dark-900 border border-red-900/30 rounded-xl p-4 flex items-center justify-between group hover:border-red-500/50 transition-all cursor-pointer" onClick={handleQuickPick}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-lg shrink-0">
                                    <Play className="w-5 h-5 fill-current" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-red-300 font-bold uppercase tracking-wider mb-0.5">
                                        {lang === 'ko' ? "최근 시청/좋아요" : "Recent Activity"}
                                    </span>
                                    <span className="text-sm font-medium text-white line-clamp-1 group-hover:text-red-200 transition-colors">
                                        {suggestedVideo.title}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-red-600/20 p-2 rounded-full group-hover:bg-red-600 group-hover:text-white transition-all">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    )}

                    {/* Option 2: Clipboard Detection */}
                    {clipboardDetected && (
                         <button 
                            onClick={handlePaste}
                            className="bg-blue-900/20 border border-blue-500/30 border-dashed hover:bg-blue-900/30 hover:border-blue-400 text-blue-100 py-3 rounded-xl flex items-center justify-center gap-2 transition-all animate-pulse"
                         >
                            <Clipboard className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium">
                                {lang === 'ko' ? "복사한 링크 붙여넣기" : "Paste Link from Clipboard"}
                            </span>
                        </button>
                    )}

                    {/* Option 3: Manual Input & Paste */}
                    <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Link className="h-4 w-4 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            value={input.youtubeUrl}
                            onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                            disabled={disabled}
                            className="w-full bg-dark-950 border border-gray-700 rounded-xl pl-10 pr-24 py-3.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder-gray-600"
                            placeholder={lang === 'ko' ? "또는 YouTube 링크를 여기에 입력..." : "Or paste YouTube URL here..."}
                        />
                        <button 
                            onClick={handlePaste}
                            className="absolute inset-y-1 right-1 bg-dark-800 hover:bg-gray-700 text-gray-300 px-3 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 h-[calc(100%-8px)]"
                        >
                            <Clipboard className="w-3.5 h-3.5" />
                            {lang === 'ko' ? "붙여넣기" : "Paste"}
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Step 2: Processing Trigger (Changes based on file presence) */}
        <div className="space-y-3">
            {!input.sourceFile ? (
                 // Upload Zone (If fetch hasn't happened yet)
                 <div 
                    onClick={() => !disabled && fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-800 hover:border-gray-600 bg-dark-950/30 rounded-xl p-6 text-center cursor-pointer transition-colors group"
                 >
                    <div className="w-10 h-10 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-500 group-hover:text-white transition-colors">
                        <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-500 group-hover:text-gray-400">
                        {lang === 'ko' ? "또는 내 컴퓨터에서 영상 파일 업로드" : "Or upload video file from computer"}
                    </p>
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="video/*" 
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={disabled}
                    />
                 </div>
            ) : (
                // Ready State
                 <div className="bg-brand-900/10 border border-brand-500/30 rounded-xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-12 h-12 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
                        <FileVideo className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white truncate">{input.sourceFile.name}</h3>
                            <span className="px-1.5 py-0.5 bg-brand-500/20 text-brand-300 text-[10px] font-bold rounded uppercase">Ready</span>
                        </div>
                        <p className="text-xs text-brand-400/70 mt-0.5">
                            {(input.sourceFile.size / 1024 / 1024).toFixed(1)} MB • Ready to analyze
                        </p>
                    </div>
                    <button 
                        onClick={() => handleChange('sourceFile', null)}
                        className="p-2 hover:bg-dark-900 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                 </div>
            )}
        </div>

        {/* 3. Options & Action */}
        <div className="space-y-4 pt-2 border-t border-gray-800/50">
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">{t('clipLengthLabel')}</label>
                    <select
                        value={input.clipLength}
                        onChange={(e) => handleChange('clipLength', e.target.value)}
                        disabled={disabled}
                        className="w-full bg-dark-950 border border-gray-700 rounded-lg px-3 py-2 text-xs focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                    >
                        <option value="15s">{t('opt_15s')}</option>
                        <option value="30s">{t('opt_30s')}</option>
                        <option value="60s">{t('opt_60s')}</option>
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">{t('clipStyleLabel')}</label>
                    <select
                        value={input.clipStyle}
                        onChange={(e) => handleChange('clipStyle', e.target.value)}
                        disabled={disabled}
                        className="w-full bg-dark-950 border border-gray-700 rounded-lg px-3 py-2 text-xs focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                    >
                        <option value="meme">{t('opt_style_meme')}</option>
                        <option value="jobs">{t('opt_style_jobs')}</option>
                        <option value="emotional">{t('opt_style_emotional')}</option>
                        <option value="clean">{t('opt_style_clean')}</option>
                    </select>
                 </div>
            </div>

            <Tooltip content={t('tip_start_btn')} position="bottom">
              <button
                onClick={onSubmit}
                disabled={disabled || !input.sourceFile}
                className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wide py-4 rounded-xl transition-all duration-200 shadow-lg shadow-brand-900/50 flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 transform skew-x-12" />
                
                {disabled ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('processingBtn')}
                    </>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4 text-yellow-300 group-hover:animate-bounce" />
                        {t('startBtn')}
                    </>
                )}
              </button>
            </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default InputForm;
