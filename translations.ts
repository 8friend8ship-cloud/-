
export type Language = 'en' | 'ko';

export const TRANSLATIONS = {
  en: {
    // Header
    appTitle: "ClipStream AI",
    appSubtitle: "Automated Shorts Creator",
    systemOnline: "SYSTEM: READY",
    
    // InputForm
    configTitle: "Creative Studio",
    youtubeUrlLabel: "Source URL",
    clipLengthLabel: "Duration",
    clipStyleLabel: "Style",
    voiceStyleLabel: "AI Voiceover",
    titleStyleLabel: "Caption Style",
    shoppingLinksLabel: "Affiliate Links",
    shoppingPlaceholder: "Paste links here...",
    startBtn: "Create AI Shorts Now",
    processingBtn: "Creating Shorts...",
    
    // Tooltips
    tip_url: "Link to the original long-form video.",
    tip_length: "Desired length (15s-60s).",
    tip_style_clip: "Visual style for the output video.",
    tip_style_voice: "AI Voice settings.",
    tip_style_title: "Caption appearance.",
    tip_shop: "Product links for monetization.",
    tip_start_btn: "Analyze video and auto-generate Shorts.",
    tip_reset: "Start over.",
    tip_run_b: "Proceed to rendering and SEO.",
    tip_run_c: "Upload to YouTube.",
    tip_dl_raw: "Download source.",
    tip_dl_kit: "Download final Shorts video.",
    
    // Options
    opt_15s: "15s (Story)",
    opt_30s: "30s (Reel)",
    opt_60s: "60s (Short)",
    opt_90s: "90s (Max)",
    
    opt_style_meme: "Viral / Meme",
    opt_style_jobs: "Professional",
    opt_style_emotional: "Cinematic",
    opt_style_clean: "Minimal",

    opt_voice_original: "Original Audio",
    opt_voice_male: "Male AI",
    opt_voice_female: "Female AI",
    opt_voice_none: "Mute",
    opt_title_bold: "Bold",
    opt_title_subtle: "Subtle",
    opt_title_neon: "Neon",
    opt_title_type: "Typewriter",

    // Pipeline
    pipelineConfigTitle: "CREATION PIPELINE",
    stageA_info: "Analyzing content...",
    stageB_info: "Rendering Shorts...",
    stageC_info: "Done.",
    
    pipelineExecTitle: "Creation Progress",

    // Result View
    stageA_complete: "Analysis Ready",
    stageB_complete: "Shorts Created!",
    stageA_sub: "Highlight found. Ready to render.",
    stageB_sub: "Your Shorts video is ready. Review below.",
    newProject: "Create Another",
    runStageB: "Render Final Video",
    processingStageB: "Rendering...",
    
    generatedAssets: "Assets",
    aiThumbnail: "Smart Thumbnail",
    optimizedMetadata: "Viral Metadata",
    highlightSegment: "Highlight",
    sourceMetadata: "Source",
    rawSource: "Raw Data",
    transcriptHead: "Transcript",
    downloadRaw: "Get Source",
    downloadKit: "Download Video",
    generatedVideoTitle: "Your AI Short",
    
    lbl_title: "Title",
    lbl_hashtags: "Tags",
    lbl_desc: "Description",
    lbl_comment: "Comment",
    lbl_duration: "Time",
    lbl_views: "Views",
    
    action_copy: "Copy",
    action_copied: "Copied",
  },
  ko: {
    appTitle: "ClipStream AI",
    appSubtitle: "자동 쇼츠 생성기",
    systemOnline: "준비 완료",
    
    configTitle: "크리에이티브 스튜디오",
    youtubeUrlLabel: "소스 URL",
    clipLengthLabel: "길이",
    clipStyleLabel: "스타일",
    voiceStyleLabel: "AI 성우",
    titleStyleLabel: "자막 스타일",
    shoppingLinksLabel: "쇼핑 링크",
    shoppingPlaceholder: "링크 입력...",
    startBtn: "AI 쇼츠 만들기",
    processingBtn: "쇼츠 제작 중...",

    // Tooltips
    tip_url: "원본 긴 영상의 URL입니다.",
    tip_length: "만들고 싶은 쇼츠의 길이입니다.",
    tip_style_clip: "편집 스타일을 선택하세요.",
    tip_style_voice: "나레이션 설정입니다.",
    tip_style_title: "자막 디자인입니다.",
    tip_shop: "수익화를 위한 상품 링크입니다.",
    tip_start_btn: "영상을 분석하고 자동으로 쇼츠를 생성합니다.",
    tip_reset: "새로 만들기",
    tip_run_b: "최종 렌더링 및 데이터 생성",
    tip_run_c: "업로드",
    tip_dl_raw: "원본 다운로드",
    tip_dl_kit: "완성본 다운로드",

    opt_15s: "15초 (스토리)",
    opt_30s: "30초 (릴스)",
    opt_60s: "60초 (쇼츠)",
    opt_90s: "90초 (풀버전)",
    
    opt_style_meme: "바이럴 / 예능",
    opt_style_jobs: "프로페셔널 / 정보",
    opt_style_emotional: "감성 / 시네마틱",
    opt_style_clean: "깔끔 / 미니멀",

    opt_voice_original: "원본 오디오",
    opt_voice_male: "AI 남성 성우",
    opt_voice_female: "AI 여성 성우",
    opt_voice_none: "음소거",
    opt_title_bold: "굵은 자막",
    opt_title_subtle: "하단 자막",
    opt_title_neon: "네온 효과",
    opt_title_type: "타자기",

    pipelineConfigTitle: "제작 파이프라인",
    stageA_info: "분석 중...",
    stageB_info: "렌더링 중...",
    stageC_info: "완료",

    pipelineExecTitle: "제작 진행 상황",

    stageA_complete: "분석 완료",
    stageB_complete: "쇼츠 제작 완료!",
    stageA_sub: "하이라이트를 찾았습니다. 제작을 진행하세요.",
    stageB_sub: "쇼츠 영상이 완성되었습니다.",
    newProject: "새로 만들기",
    runStageB: "최종 영상 렌더링",
    processingStageB: "제작 중...",
    
    generatedAssets: "자산",
    aiThumbnail: "AI 썸네일",
    optimizedMetadata: "바이럴 메타데이터",
    highlightSegment: "하이라이트",
    sourceMetadata: "원본 정보",
    rawSource: "Raw 데이터",
    transcriptHead: "자막",
    downloadRaw: "원본 받기",
    downloadKit: "영상 다운로드",
    generatedVideoTitle: "완성된 AI 쇼츠",

    lbl_title: "제목",
    lbl_hashtags: "태그",
    lbl_desc: "설명",
    lbl_comment: "댓글",
    lbl_duration: "시간",
    lbl_views: "조회수",

    action_copy: "복사",
    action_copied: "완료",
  }
};

export const STEP_DEFINITIONS: Record<string, { en: { label: string, desc: string }, ko: { label: string, desc: string } }> = {
  Step_2: {
    en: { label: 'Analyzing Source', desc: 'Validating video format and access.' },
    ko: { label: '소스 분석', desc: '영상 포맷과 접근 권한을 확인합니다.' }
  },
  Step_3: {
    en: { label: 'Metadata Scan', desc: 'Extracting contextual information.' },
    ko: { label: '메타데이터 스캔', desc: '영상의 문맥 정보를 추출합니다.' }
  },
  Step_4: {
    en: { label: 'Video Processing', desc: 'Preparing video buffer for editing.' },
    ko: { label: '비디오 처리', desc: '편집을 위해 비디오 버퍼를 준비합니다.' }
  },
  Step_5: {
    en: { label: 'Audio Separation', desc: 'Isolating vocal tracks.' },
    ko: { label: '오디오 분리', desc: '보컬 트랙을 분리합니다.' }
  },
  Step_6: {
    en: { label: 'AI Transcription', desc: 'Converting speech to text.' },
    ko: { label: 'AI 자막 생성', desc: '음성을 텍스트로 변환합니다.' }
  },
  Step_7: {
    en: { label: 'Context Analysis', desc: 'Understanding video content.' },
    ko: { label: '문맥 분석', desc: '영상 내용을 심층 분석합니다.' }
  },
  Step_8: {
    en: { label: 'Highlight Detection', desc: 'Finding the most viral moment.' },
    ko: { label: '하이라이트 감지', desc: '가장 바이럴한 순간을 찾아냅니다.' }
  },
  Step_9: {
    en: { label: 'Smart Cut', desc: 'Trimming video to vertical format.' },
    ko: { label: '스마트 컷', desc: '세로 화면으로 영상을 트리밍합니다.' }
  },
  Step_10: {
    en: { label: 'Captioning', desc: 'Applying dynamic subtitles.' },
    ko: { label: '자막 입히기', desc: '다이내믹 자막 효과를 적용합니다.' }
  },
  Step_11: {
    en: { label: 'Sound Engineering', desc: 'Mixing voice and background.' },
    ko: { label: '사운드 믹싱', desc: '음성과 배경음을 조절합니다.' }
  },
  Step_12: {
    en: { label: 'Visual Polish', desc: 'Generating thumbnails.' },
    ko: { label: '비주얼 작업', desc: '썸네일을 생성합니다.' }
  },
  Step_13: {
    en: { label: 'Viral SEO', desc: 'Writing optimized titles/tags.' },
    ko: { label: '바이럴 SEO', desc: '최적화된 제목과 태그를 작성합니다.' }
  },
  Step_14: {
    en: { label: 'Final Rendering', desc: 'Packaging final output.' },
    ko: { label: '최종 렌더링', desc: '결과물을 패키징합니다.' }
  }
};
