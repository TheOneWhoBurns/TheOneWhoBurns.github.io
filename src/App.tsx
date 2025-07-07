import React, { useState } from 'react';
import Background from './components/Background.tsx';
import SpotifyLogin from './components/SpotifyLogin.tsx';

interface NextStep {
  id: number;
  text: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  const handleLoginSuccess = (userInfo: any) => {
    setUser(userInfo);
  };

  const nextSteps: NextStep[] = [
    { id: 1, text: "Set up your React development environment ✅" },
    { id: 2, text: "Register your app with Spotify Developer Dashboard ✅" },
    { id: 3, text: "Implement Spotify OAuth with PKCE flow ✅" },
    { id: 4, text: "Fetch user's saved albums via Spotify API" },
    { id: 5, text: "Build the album shuffle logic" },
    { id: 6, text: "Deploy your React build to replace this test page" }
  ];

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
          <SpotifyLogin onLoginSuccess={handleLoginSuccess} />
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
        
        <div className="mt-8 p-6 bg-white/5 rounded-lg text-left">
          <h3 className="mb-4 text-green-400 font-semibold text-lg">
            🚀 Next Steps:
          </h3>
          <ol className="ml-6 space-y-2">
            {nextSteps.map((step) => (
              <li key={step.id} className="leading-relaxed">
                {step.text}
              </li>
            ))}
          </ol>
        </div>
        
        <footer className="mt-8 opacity-60 text-sm">
          Ready to build something awesome! 🎧
        </footer>
      </div>
    </div>
  );
};

export default App;