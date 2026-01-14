import { useState, useCallback } from 'react';
import Background from './components/Background.tsx';
import SpotifyLogin from './components/SpotifyLogin.tsx';
import AlbumShuffler from './components/AlbumShuffler.tsx';
import { SpotifyAuth } from './services/spotifyAuth.ts';
import { SpotifyAlbum, SpotifyPlaylist } from './types/spotify.ts';

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [libraryLoaded, setLibraryLoaded] = useState(false);

  const handleLoginSuccess = useCallback((userInfo: any) => {
    setUser(userInfo);
    setLibraryLoaded(false);
    setAlbums([]);
    setPlaylists([]);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setAlbums([]);
    setPlaylists([]);
    setLibraryLoaded(false);
  }, []);

  const handleLoadLibrary = async () => {
    const token = SpotifyAuth.getAccessToken();
    if (!token) return;

    setIsLoading(true);
    try {
      const [albumsData, playlistsData] = await Promise.all([
        SpotifyAuth.fetchUserAlbums(),
        SpotifyAuth.fetchUserPlaylists(),
      ]);
      setAlbums(albumsData);
      setPlaylists(playlistsData);
      setLibraryLoaded(true);
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white font-sans relative p-4">
      <Background />
      <div className="w-full max-w-lg p-8 bg-black/40 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-spotify-green to-spotify-green-light bg-clip-text text-transparent">
            Album Shuffler
          </h1>
          <p className="text-white/60">
            Shuffle your albums, not just your songs
          </p>
        </div>

        {!user ? (
          <div className="text-center">
            <SpotifyLogin onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />
          </div>
        ) : !libraryLoaded ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
              {user.images?.[0] && (
                <img
                  src={user.images[0].url}
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="flex-1 text-left">
                <p className="font-medium">{user.display_name}</p>
                <p className="text-sm text-white/50">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-red-400 hover:text-red-300 transition"
              >
                Logout
              </button>
            </div>

            <button
              onClick={handleLoadLibrary}
              disabled={isLoading}
              className="w-full py-4 rounded-full font-bold text-lg transition-all bg-gradient-to-r from-spotify-green to-spotify-green-light text-black hover:scale-[1.02] hover:shadow-lg hover:shadow-spotify-green/30 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Loading Library...
                </span>
              ) : (
                'Load My Library'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-white/50">
              <span>{albums.length} albums / {playlists.length} playlists</span>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 transition"
              >
                Logout
              </button>
            </div>

            <AlbumShuffler albums={albums} playlists={playlists} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
