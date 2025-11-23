
import React, { useState } from 'react';
import { Comment, Language } from '../types';
import { MessageSquare, ThumbsUp, CornerDownRight, Wand2, Send, RefreshCw, Lock } from 'lucide-react';
import { generateAICommentReply } from '../services/gemini';
import { AuthService } from '../services/auth';

interface CommentAutomationProps {
  comments: Comment[];
  lang: Language;
  isAuthenticated: boolean;
  onLoginRequest: () => void;
  accessToken?: string | null;
}

const CommentAutomation: React.FC<CommentAutomationProps> = ({ comments, lang, isAuthenticated, onLoginRequest, accessToken }) => {
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [postingId, setPostingId] = useState<string | null>(null);

  const handleGenerateReply = async (comment: Comment) => {
    if (!isAuthenticated) {
        onLoginRequest();
        return;
    }
    setLoadingId(comment.id);
    const reply = await generateAICommentReply(comment.text, comment.sentiment, lang);
    
    setLocalComments(prev => prev.map(c => 
        c.id === comment.id ? { ...c, reply } : c
    ));
    setLoadingId(null);
  };

  const handlePostReply = async (id: string) => {
    if (!isAuthenticated) return;
    
    setPostingId(id);
    const comment = localComments.find(c => c.id === id);
    
    if (comment && comment.reply) {
        // Trigger Real/Mock API
        const success = await AuthService.postReply(accessToken || null, id, comment.reply);
        
        if (success) {
             setLocalComments(prev => prev.map(c => 
                c.id === id ? { ...c, isReplied: true } : c
            ));
        } else {
            alert(lang === 'ko' ? "답글 게시에 실패했습니다." : "Failed to post reply.");
        }
    }
    setPostingId(null);
  };

  if (!isAuthenticated) {
      return (
          <div className="bg-dark-950 border border-gray-800 rounded-xl p-8 text-center flex flex-col items-center gap-4">
              <div className="p-4 bg-dark-900 rounded-full">
                  <Lock className="w-8 h-8 text-gray-500" />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                      {lang === 'ko' ? "댓글 자동화 기능 잠금" : "Automation Locked"}
                  </h3>
                  <p className="text-sm text-gray-400 max-w-md">
                      {lang === 'ko' 
                        ? "이 기능을 사용하려면 Google 계정으로 로그인하여 YouTube 채널 권한을 승인해야 합니다." 
                        : "To use this feature, please log in with Google and authorize channel access."}
                  </p>
              </div>
              <button 
                onClick={onLoginRequest}
                className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                 {lang === 'ko' ? "로그인하고 시작하기" : "Login to Access"}
              </button>
          </div>
      );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-500" />
              {lang === 'ko' ? "최근 댓글 관리" : "Community Engagement"}
          </h3>
          <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
              Live Connection
          </div>
      </div>

      <div className="space-y-4">
        {localComments.map((comment) => (
          <div key={comment.id} className={`bg-dark-900 rounded-xl p-4 border ${comment.isReplied ? 'border-green-900/30 opacity-70' : 'border-gray-800 hover:border-gray-700'} transition-all`}>
            {/* Comment Header */}
            <div className="flex items-start gap-3 mb-3">
                <img src={comment.avatar} alt={comment.author} className="w-8 h-8 rounded-full bg-gray-800" />
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-200">{comment.author}</span>
                        <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1 leading-relaxed">{comment.text}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {comment.likes}</span>
                        <span className={`uppercase font-bold text-[10px] px-1.5 py-0.5 rounded ${
                            comment.sentiment === 'positive' ? 'bg-green-900/30 text-green-400' : 
                            comment.sentiment === 'negative' ? 'bg-red-900/30 text-red-400' : 'bg-gray-800 text-gray-400'
                        }`}>
                            {comment.sentiment}
                        </span>
                    </div>
                </div>
            </div>

            {/* Reply Area */}
            {!comment.isReplied && (
                <div className="ml-11 bg-dark-950 rounded-lg p-3 border border-gray-800/50 relative">
                    {comment.reply ? (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <div className="w-1 h-auto bg-brand-500 rounded-full"/>
                                <textarea 
                                    value={comment.reply}
                                    onChange={(e) => setLocalComments(prev => prev.map(c => c.id === comment.id ? {...c, reply: e.target.value} : c))}
                                    className="w-full bg-transparent text-sm text-brand-100 focus:outline-none resize-none"
                                    rows={2}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => handleGenerateReply(comment)}
                                    className="p-2 hover:bg-dark-800 rounded text-gray-400 hover:text-white transition-colors"
                                    title="Regenerate"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handlePostReply(comment.id)}
                                    disabled={postingId === comment.id}
                                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50"
                                >
                                    {postingId === comment.id ? (
                                         <RefreshCw className="w-3 h-3 animate-spin" />
                                    ) : (
                                         <Send className="w-3 h-3" />
                                    )}
                                    {lang === 'ko' ? "답글 게시" : "Post Reply"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => handleGenerateReply(comment)}
                            disabled={loadingId === comment.id}
                            className="flex items-center gap-2 text-brand-400 hover:text-brand-300 text-xs font-medium transition-colors w-full"
                        >
                            {loadingId === comment.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Wand2 className="w-4 h-4" />
                            )}
                            {lang === 'ko' ? "AI 답글 생성하기..." : "Generate AI Reply..."}
                        </button>
                    )}
                </div>
            )}
            
            {comment.isReplied && (
                 <div className="ml-11 mt-2 flex items-center gap-2 text-xs text-green-500 font-medium bg-green-900/10 p-2 rounded border border-green-900/20">
                    <CheckCircle className="w-3 h-3" />
                    {lang === 'ko' ? "답글이 게시되었습니다" : "Reply posted via API"}
                 </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper for check icon
const CheckCircle = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

export default CommentAutomation;
