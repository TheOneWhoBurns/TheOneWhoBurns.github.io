import React, { useState, useCallback, useRef } from 'react';
import Background from './components/Background.tsx';
import SpotifyLogin from './components/SpotifyLogin.tsx';
import { SpotifyAuth } from './services/spotifyAuth.ts';
import { useVirtualizer } from '@tanstack/react-virtual';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [albums, setAlbums] = useState<any[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: albums.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });


  const handleLoginSuccess = useCallback((userInfo: any) => {
    setUser(userInfo);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
  }, []);

  const handleFetchAlbums = async () => {
    const token = SpotifyAuth.getAccessToken()

    if (!token) {
      console.error('No access token available');
      return;
    }

    const albumsData = await SpotifyAuth.fetchUserAlbums();
    setAlbums(albumsData);
  
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white font-sans relative">
      <Background />
      <div className="text-center max-w-2xl p-8 bg-black/30 rounded-2xl backdrop-blur-sm border border-white/10">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-spotify-green to-spotify-green-light bg-clip-text text-transparent">
          🎵 Album Shuffler
        </h1>
        <p className="text-xl opacity-80 mb-8">
          Shuffle your albums, not just your songs
        </p>
        
        <div className="mb-6">
          <SpotifyLogin onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />
        </div>
        
        {user && (
          <div className="mb-6 p-6 bg-green-900/20 rounded-lg border border-green-500/50">
            <h3 className="text-xl font-bold text-green-400 mb-4">🎯 User Data Test Success!</h3>
            <div className="text-left space-y-2 text-sm">
              <p><strong>Display Name:</strong> {user.display_name || 'N/A'}</p>
              <p><strong>Email:</strong> {user.email || 'N/A'}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Followers:</strong> {user.followers?.total || 0}</p>
              <p><strong>Country:</strong> {user.country || 'N/A'}</p>
              <p><strong>Subscription:</strong> {user.product || 'N/A'}</p>
              {user.images && user.images[0] && (
                <div className="mt-3">
                  <img 
                    src={user.images[0].url} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full"
                  />
                </div>
              )}
            </div>
          </div>
          )}
          <div className="flex-3 text-xs">
            <button 
              className="px-4 py-2 bg-spotify-green hover:bg-spotify-green-light rounded-full text-white font-bold transition"
              onClick={handleFetchAlbums}>
              Fetch User Albums
            </button>
          </div>

          <div>
            {albums.length > 0 && (
              <div className="mt-6 text-left">
                <h3 className="text-xl font-bold mb-4">User Albums ({albums.length}):</h3>
                <div ref={parentRef} className="border border-white/10 rounded-lg overflow-auto" style={{ height: 400 }}>
                  <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
                    {virtualizer.getVirtualItems().map((row) => (
                      <div key={row.index} className="p-2 border-b border-white/10 absolute w-full" style={{ height: row.size, transform: `translateY(${row.start}px)` }}>
                        <strong>{albums[row.index].album.name}</strong> by {albums[row.index].album.artists.map((a: any) => a.name).join(', ')}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}  
          </div>
        
      </div>
    </div>
  );
};

export default App;