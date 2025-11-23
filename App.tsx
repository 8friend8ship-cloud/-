
import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_INPUT, 
  UserInput, 
  PipelineStep, 
  StepStatus, 
  PipelineStatus, 
  PipelineResult,
  VideoMetadata,
  SubtitleItem,
  Language,
  AuthState,
  Comment
} from './types';
import InputForm from './components/InputForm';
import PipelineStatusView from './components/PipelineStatus';
import ResultView from './components/ResultView';
import { 
  fetchMockMetadata, 
  generateMockTranscript,
  generateHighlights,
  generateThumbnail,
  generateSeoData,
  generateEditedClip,
  generateVoiceScript,
  generateOverlaySubtitles,
  generateMockComments
} from './services/gemini';
import { AuthService } from './services/auth';
import { Activity, Globe, CloudLightning, LogIn, User, LogOut, Loader2 } from 'lucide-react';
import { TRANSLATIONS, STEP_DEFINITIONS } from './translations';

const getSteps = (ids: string[], lang: Language): PipelineStep[] => {
  return ids.map(id => ({
    id,
    label: STEP_DEFINITIONS[id]?.[lang].label || id,
    description: STEP_DEFINITIONS[id]?.[lang].desc || '',
    status: StepStatus.PENDING,
    logs: []
  }));
};

const STAGE_A_IDS = ['Step_2', 'Step_3', 'Step_4', 'Step_5', 'Step_6', 'Step_7'];
const STAGE_B_IDS = ['Step_8', 'Step_9', 'Step_10', 'Step_11', 'Step_12', 'Step_13', 'Step_14'];

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ko');
  const [input, setInput] = useState<UserInput>(DEFAULT_INPUT);
  const [status, setStatus] = useState<PipelineStatus>(PipelineStatus.IDLE);
  const [steps, setSteps] = useState<PipelineStep[]>(getSteps(STAGE_A_IDS, 'ko'));
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [stage, setStage] = useState<'A' | 'B' | 'C'>('A');
  
  // Auth State
  const [auth, setAuth] = useState<AuthState>({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Download Simulation States
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const t = (key: keyof typeof TRANSLATIONS['en']) => TRANSLATIONS[lang][key];

  useEffect(() => {
    setSteps(prevSteps => prevSteps.map(step => {
      const def = STEP_DEFINITIONS[step.id];
      if (def) {
        return { ...step, label: def[lang].label, description: def[lang].desc };
      }
      return step;
    }));
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'ko' : 'en');
  };

  // Auth Handlers
  const handleLogin = async () => {
      setIsLoggingIn(true);
      try {
          const newAuth = await AuthService.login();
          setAuth(newAuth);
          
          // Auto-fetch liked videos upon login
          try {
            // Pass access token for real API call
            const likedVideos = await AuthService.fetchUserLikedVideos(newAuth.accessToken || undefined);
            if (likedVideos.length > 0 && (!input.youtubeUrl || input.youtubeUrl === DEFAULT_INPUT.youtubeUrl)) {
                setInput(prev => ({ ...prev, youtubeUrl: likedVideos[0].url }));
            }
          } catch (fetchErr) {
              console.error("Failed to auto-fetch liked videos", fetchErr);
          }

      } catch (e) {
          console.error("Login failed", e);
          alert(lang === 'ko' ? "로그인에 실패했습니다. 팝업이 차단되었는지 확인해주세요." : "Login failed. Please check popup blockers.");
      } finally {
          setIsLoggingIn(false);
      }
  };

  const handleLogout = async () => {
      const newAuth = await AuthService.logout();
      setAuth(newAuth);
  };
  
  const handleImportLiked = async () => {
      if (!auth.isAuthenticated) return;
      const likedVideos = await AuthService.fetchUserLikedVideos(auth.accessToken || undefined);
      if (likedVideos.length > 0) {
          setInput(prev => ({ ...prev, youtubeUrl: likedVideos[0].url }));
      }
  };

  const updateStep = (id: string, updates: Partial<PipelineStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addLog = (id: string, log: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, logs: [...s.logs, log] } : s));
  };

  const handleDownload = async () => {
    if (!input.youtubeUrl) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Simulate connection
      for (let i = 0; i <= 30; i += 5) {
        setDownloadProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }

      // Actually fetch a dummy file to create a real File object
      const fetchPromise = fetch('https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4')
        .then(res => res.blob());
      
      const progressPromise = (async () => {
        for (let i = 30; i <= 85; i += 2) {
           setDownloadProgress(i);
           await new Promise(r => setTimeout(r, 50));
        }
      })();

      const [blob] = await Promise.all([fetchPromise, progressPromise]);
      
      setDownloadProgress(90);
      await new Promise(r => setTimeout(r, 300));
      setDownloadProgress(100);
      
      // Create a File object from the Blob
      const videoId = input.youtubeUrl.includes('v=') ? input.youtubeUrl.split('v=')[1].substring(0, 11) : 'video';
      const fileName = `YouTube_Source_${videoId}.mp4`;
      const file = new File([blob], fileName, { type: "video/mp4" });
      
      // Transfer to Input State (Step 2)
      setInput(prev => ({ ...prev, sourceFile: file }));
      
      // Small delay for visual feedback
      await new Promise(r => setTimeout(r, 500));

    } catch (e) {
      console.error("Download failed", e);
      alert(lang === 'ko' ? "다운로드 실패 (네트워크 오류)" : "Download Failed");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const runStageA = async () => {
    setStatus(PipelineStatus.RUNNING);
    setStage('A');
    setResult(null);
    setSteps(getSteps(STAGE_A_IDS, lang));

    let currentMetadata: VideoMetadata | null = null;
    let currentSubtitles: SubtitleItem[] = [];
    let localFileUrl = undefined;

    try {
      updateStep('Step_2', { status: StepStatus.ACTIVE });
      await new Promise(r => setTimeout(r, 500));
      // If logged in, simulate API call with Token
      if (auth.isAuthenticated) {
          addLog('Step_2', `Authenticated Request (Bearer ${auth.accessToken?.substring(0, 10)}...)`);
      }
      
      if (!input.youtubeUrl.includes('youtube') && !input.youtubeUrl.includes('youtu.be')) {
          throw new Error("Invalid URL");
      }
      addLog('Step_2', `Valid URL: ${input.youtubeUrl}`);
      updateStep('Step_2', { status: StepStatus.COMPLETED });

      updateStep('Step_3', { status: StepStatus.ACTIVE });
      currentMetadata = await fetchMockMetadata(input.youtubeUrl, lang);
      addLog('Step_3', `ID: ${currentMetadata.id} | Title: ${currentMetadata.title}`);
      updateStep('Step_3', { status: StepStatus.COMPLETED });

      updateStep('Step_4', { status: StepStatus.ACTIVE });
      if (input.sourceFile) {
          addLog('Step_4', "Source Verification: Local File Detected.");
          addLog('Step_4', `File: ${input.sourceFile.name} (${(input.sourceFile.size / 1024 / 1024).toFixed(2)}MB)`);
          localFileUrl = URL.createObjectURL(input.sourceFile);
          await new Promise(r => setTimeout(r, 800));
          addLog('Step_4', "Input stream active: Ready for processing.");
      } else {
          addLog('Step_4', "No local file. Initiating cloud stream...");
          addLog('Step_4', "Virtual source acquired.");
      }
      updateStep('Step_4', { status: StepStatus.COMPLETED });

      updateStep('Step_5', { status: StepStatus.ACTIVE });
      addLog('Step_5', "Extracting audio track...");
      await new Promise(r => setTimeout(r, 600));
      updateStep('Step_5', { status: StepStatus.COMPLETED });

      updateStep('Step_6', { status: StepStatus.ACTIVE });
      currentSubtitles = await generateMockTranscript(currentMetadata.title, lang);
      updateStep('Step_6', { status: StepStatus.COMPLETED });

      updateStep('Step_7', { status: StepStatus.ACTIVE });
      setResult({
        metadata: currentMetadata,
        subtitles: currentSubtitles,
        videoPath: input.sourceFile ? input.sourceFile.name : '/tmp/source.mp4',
        localFileUrl: localFileUrl
      });
      updateStep('Step_7', { status: StepStatus.COMPLETED });
      setStatus(PipelineStatus.COMPLETED);

    } catch (error: any) {
      handleError(error);
    }
  };

  const runStageB = async () => {
    if (!result) return;
    setStatus(PipelineStatus.RUNNING);
    setStage('B');
    setSteps(prev => [...prev, ...getSteps(STAGE_B_IDS, lang)]);

    try {
      updateStep('Step_8', { status: StepStatus.ACTIVE });
      addLog('Step_8', "Analyzing engagement metrics...");
      const highlights = await generateHighlights(result.subtitles, input.clipLength, input.clipStyle, lang);
      addLog('Step_8', `Target Segment: ${highlights[0].start}s - ${highlights[0].end}s`);
      updateStep('Step_8', { status: StepStatus.COMPLETED });

      updateStep('Step_9', { status: StepStatus.ACTIVE });
      if (result.localFileUrl) {
          addLog('Step_9', "Processing Local Video Buffer...");
          addLog('Step_9', `Applying Cut: ${highlights[0].start.toFixed(1)}s to ${highlights[0].end.toFixed(1)}s`);
      } else {
          addLog('Step_9', "Accessing Cloud Storage...");
          addLog('Step_9', `Slicing video frame: ${highlights[0].start} to ${highlights[0].end}...`);
      }
      
      await new Promise(r => setTimeout(r, 1000));
      const cutUrl = await generateEditedClip(result.metadata!.id, highlights, input.clipStyle);
      updateStep('Step_9', { status: StepStatus.COMPLETED });

      updateStep('Step_10', { status: StepStatus.ACTIVE });
      addLog('Step_10', "Analyzing visual context...");
      const script = await generateVoiceScript(highlights[0], result.subtitles, input.voiceStyle, lang);
      addLog('Step_10', `Script generated (${script.length} chars)`);
      
      const overlaySubs = await generateOverlaySubtitles(script, highlights[0].end - highlights[0].start);
      updateStep('Step_10', { status: StepStatus.COMPLETED });

      updateStep('Step_11', { status: StepStatus.ACTIVE });
      addLog('Step_11', "Synthesizing Neural Audio...");
      addLog('Step_11', "Mixing audio tracks...");
      await new Promise(r => setTimeout(r, 1000));
      updateStep('Step_11', { status: StepStatus.COMPLETED });

      updateStep('Step_12', { status: StepStatus.ACTIVE });
      const thumbUrl = await generateThumbnail(result.metadata!);
      updateStep('Step_12', { status: StepStatus.COMPLETED });

      updateStep('Step_13', { status: StepStatus.ACTIVE });
      const seoData = await generateSeoData(result.metadata!, script, input.clipStyle, lang);
      updateStep('Step_13', { status: StepStatus.COMPLETED });

      updateStep('Step_14', { status: StepStatus.ACTIVE });
      addLog('Step_14', "Finalizing build...");
      updateStep('Step_14', { status: StepStatus.COMPLETED });

      setResult(prev => prev ? {
        ...prev,
        stageB: {
          highlights,
          thumbnails: [thumbUrl],
          productSummaries: [],
          seo: seoData,
          generatedVideoUrl: cutUrl,
          generatedScript: script,
          overlaySubtitles: overlaySubs
        }
      } : null);
      setStatus(PipelineStatus.COMPLETED);

    } catch (error: any) {
      handleError(error);
    }
  };
  
  const runStageC = async () => {
      if (!result || !result.metadata) return;
      setStage('C');
      const comments = await generateMockComments(result.metadata.title, lang);
      setResult(prev => prev ? {
          ...prev,
          stageC: {
              comments,
              autoReplyStats: { total: comments.length, replied: 0 }
          }
      } : null);
  };

  const handleError = (error: any) => {
    console.error(error);
    setStatus(PipelineStatus.ERROR);
    const active = steps.find(s => s.status === StepStatus.ACTIVE);
    if (active) updateStep(active.id, { status: StepStatus.ERROR, logs: [...active.logs, error.message] });
  };

  const resetPipeline = () => {
    setStatus(PipelineStatus.IDLE);
    setResult(null);
    setSteps(getSteps(STAGE_A_IDS, lang));
    setStage('A');
  };

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-500/10 rounded-lg border border-brand-500/20">
              <CloudLightning className="w-8 h-8 text-brand-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">{t('appTitle')}</h1>
              <p className="text-gray-500 text-sm">{t('appSubtitle')}</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            {/* Language Toggle */}
             <button 
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-700 bg-dark-950 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-mono font-bold">{lang === 'en' ? 'EN' : 'KO'}</span>
            </button>
            
            {/* Login / Auth Status */}
            {auth.isAuthenticated && auth.user ? (
                <div className="flex items-center gap-3 bg-dark-950 border border-brand-500/30 px-3 py-1.5 rounded-full">
                    <img src={auth.user.avatarUrl} alt="User" className="w-5 h-5 rounded-full bg-gray-800" />
                    <span className="text-xs font-medium text-brand-200">{auth.user.name}</span>
                    <button onClick={handleLogout} className="ml-2 text-gray-500 hover:text-red-400 transition-colors">
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>
            ) : (
                <button 
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-brand-900/20 transition-all disabled:opacity-70"
                >
                    {isLoggingIn ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <LogIn className="w-3 h-3" />
                    )}
                    {lang === 'ko' ? "구글 로그인" : "Login with Google"}
                </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <InputForm 
              input={input} 
              onChange={setInput} 
              disabled={status === PipelineStatus.RUNNING || stage === 'B' || stage === 'C'}
              onSubmit={runStageA}
              lang={lang}
              onLoadSample={handleDownload}
              isLoadingSample={isDownloading}
              onImportLiked={handleImportLiked}
              isAuthenticated={auth.isAuthenticated}
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            {result && (status !== PipelineStatus.RUNNING || stage === 'B' || stage === 'C') ? (
              <ResultView 
                result={result} 
                onReset={resetPipeline} 
                onRunStageB={runStageB}
                onRunStageC={runStageC}
                isStageBRunning={status === PipelineStatus.RUNNING && stage === 'B'}
                isStageCRunning={false}
                lang={lang}
                auth={auth}
                onLoginRequest={handleLogin}
              />
            ) : (
              <PipelineStatusView steps={steps} lang={lang} />
            )}
            {status === PipelineStatus.RUNNING && result && (
               <div className="mt-4 animate-in fade-in">
                 <PipelineStatusView steps={steps.slice(stage === 'B' ? STAGE_A_IDS.length : 0)} lang={lang} />
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
