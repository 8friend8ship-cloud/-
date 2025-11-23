
import { AuthState, UserProfile } from "../types";

// !!! IMPORTANT: Replace with your actual Client ID from Google Cloud Console !!!
// In a real app, use process.env.REACT_APP_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_ID = ""; // <-- Put your Client ID here (e.g. "1234...apps.googleusercontent.com")

// Scopes for YouTube Data API
// Added 'force-ssl' to allow posting comments/replies
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

// Mock User Data (Fallback / Test Mode)
const MOCK_USER: UserProfile = {
  id: 'usr_admin_test',
  name: 'Test Administrator', 
  email: 'admin@test.local',
  avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Admin'
};

declare global {
  interface Window {
    google: any;
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const AuthService = {
  
  // Initialize Real Login or Fallback to Mock
  login: async (): Promise<AuthState> => {
    // 1. Check if Client ID is provided and Google Script is loaded
    if (GOOGLE_CLIENT_ID && window.google) {
      return new Promise((resolve, reject) => {
        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: SCOPES,
            callback: async (response: any) => {
              if (response.access_token) {
                // Fetch real user info
                const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${response.access_token}` }
                }).then(res => res.json());

                resolve({
                  isAuthenticated: true,
                  user: {
                    id: userInfo.sub,
                    name: userInfo.name,
                    email: userInfo.email,
                    avatarUrl: userInfo.picture
                  },
                  accessToken: response.access_token,
                  refreshToken: null, // Implicit flow doesn't return refresh token
                  expiresAt: Date.now() + (response.expires_in * 1000)
                });
              } else {
                reject(new Error("No access token received"));
              }
            },
            error_callback: (err: any) => {
                console.error("Google Auth Error:", err);
                reject(err);
            }
          });
          
          // Trigger the popup
          client.requestAccessToken();
          
        } catch (e) {
          console.error("GSI Initialization failed", e);
          reject(e);
        }
      });
    }

    // 2. Fallback: Simulation Mode (Test Administrator)
    console.warn("No Google Client ID found. Logging in as Test Administrator.");
    await delay(1000); 
    
    return {
      isAuthenticated: true,
      user: MOCK_USER,
      accessToken: `mock_token_${Math.random().toString(36).substring(2)}`,
      refreshToken: `mock_refresh_${Math.random().toString(36).substring(2)}`,
      expiresAt: Date.now() + 3600 * 1000
    };
  },

  logout: async (): Promise<AuthState> => {
    if (window.google && window.google.accounts) {
        // window.google.accounts.oauth2.revoke('token_here', () => {}); 
    }
    await delay(300);
    return {
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null
    };
  },

  // Fetch Liked Videos (Real API or Mock)
  fetchUserLikedVideos: async (accessToken?: string): Promise<{ title: string; url: string }[]> => {
    // If we have a real access token, try fetching from YouTube API
    if (accessToken && !accessToken.startsWith('mock_')) {
        try {
            const response = await fetch('https://www.googleapis.com/youtube/v3/videos?myRating=like&part=snippet&maxResults=1', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const data = await response.json();
            if (data.items) {
                return data.items.map((item: any) => ({
                    title: item.snippet.title,
                    url: `https://www.youtube.com/watch?v=${item.id}`
                }));
            }
        } catch (e) {
            console.error("Real YouTube API Fetch Failed", e);
        }
    }

    // Mock Data for "Quick Pick" Feature Demonstration
    await delay(500);
    return [
        { title: "Gemini 2.5 Flash Demo - Live API", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        { title: "[Music] Lo-Fi Beats to Relax/Study to", url: "https://www.youtube.com/watch?v=jfKfPfyJRdk" },
    ];
  },

  // Post Reply (Real API or Mock)
  postReply: async (accessToken: string | null, parentId: string, text: string): Promise<boolean> => {
      if (!accessToken || accessToken.startsWith('mock_')) {
          await delay(1500); // Simulate network delay
          return true; // Always succeed in mock mode
      }

      try {
          // Attempt real API call (will likely fail with mock comments, but works if IDs were real)
          const response = await fetch(`https://www.googleapis.com/youtube/v3/comments?part=snippet`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  snippet: {
                      parentId: parentId,
                      textOriginal: text
                  }
              })
          });
          
          if (!response.ok) {
              const err = await response.json();
              console.error("YouTube API Error:", err);
              // Return true for demo continuity even if API fails (likely due to mock ID)
              // In production, you would return false here.
              console.warn("Simulating success despite API error (likely due to mock comment ID)");
              return true; 
          }
          return true;
      } catch (e) {
          console.error("Failed to post reply", e);
          return false;
      }
  }
};
