import React, { useState, useEffect } from 'react';
import { SpotifyAuth } from '../services/spotifyAuth.ts';

interface SpotifyLoginProps {
  onLoginSuccess: (userInfo: any) => void;
}

const SpotifyLogin: React.FC<SpotifyLoginProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    // Check if we're returning from Spotify auth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code')) {
      handleAuthCallback();
    } else if (SpotifyAuth.isLoggedIn()) {
      // Already logged in, test the connection
      testConnection();
    }
  }, []);

  const handleAuthCallback = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await SpotifyAuth.handleCallback();
      await testConnection();
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const user = await SpotifyAuth.testConnection();
      setUserInfo(user);
      onLoginSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Spotify');
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await SpotifyAuth.login();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    SpotifyAuth.logout();
    setUserInfo(null);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p>Connecting to Spotify...</p>
      </div>
    );
  }

  if (userInfo) {
    return (
      <div className="text-center p-8 bg-green-900/20 rounded-lg border border-green-500/50">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-green-400 mb-2">Connected to Spotify! 🎵</h3>
          <p className="text-sm opacity-80">Welcome, {userInfo.display_name || userInfo.id}!</p>
          {userInfo.images && userInfo.images[0] && (
            <img 
              src={userInfo.images[0].url} 
              alt="Profile" 
              className="w-16 h-16 rounded-full mx-auto mt-2"
            />
          )}
        </div>
        <div className="text-xs opacity-60 mb-4">
          <p>User ID: {userInfo.id}</p>
          <p>Email: {userInfo.email}</p>
          <p>Followers: {userInfo.followers?.total || 0}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="text-center p-8">
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
          <p className="text-red-400">Error: {error}</p>
        </div>
      )}
      
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 mx-auto"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.6 0-.359.24-.66.6-.78 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02l-.12-.06zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.48.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
        Login with Spotify
      </button>
      
      <p className="text-sm opacity-60 mt-4">
        Connect your Spotify account to shuffle your albums
      </p>
    </div>
  );
};

export default SpotifyLogin;