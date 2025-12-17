// Spotify OAuth 2.0 with PKCE flow
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "";
const REDIRECT_URI = 'https://theonewhoburns.github.io/callback';
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-library-read',
  'playlist-read-private',
  'playlist-read-collaborative'
].join(' ');

// PKCE helper functions
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64encode(input: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}



export class SpotifyAuth {
  private static codeVerifier: string | null = null;

  static async login(): Promise<void> {
    // Generate PKCE values
    this.codeVerifier = generateRandomString(64);
    const hashed = await sha256(this.codeVerifier);
    const codeChallenge = base64encode(hashed);

    // Store code verifier for later use
    localStorage.setItem('spotify_code_verifier', this.codeVerifier);

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', CLIENT_ID);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('scope', SCOPES);

    window.location.href = authUrl.toString();
  }

  static async handleCallback(): Promise<string | null> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (!code) {
      throw new Error('No authorization code found in URL');
    }

    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      throw new Error('No code verifier found in localStorage');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const data = await response.json();
    
    localStorage.setItem('spotify_access_token', data.access_token);
    localStorage.setItem('spotify_refresh_token', data.refresh_token);
    localStorage.setItem('spotify_expires_at', (Date.now() + data.expires_in * 1000).toString());

    localStorage.removeItem('spotify_code_verifier');

    return data.access_token;
  }

  static getAccessToken(): string | null {
    const token = localStorage.getItem('spotify_access_token');
    const expiresAt = localStorage.getItem('spotify_expires_at');

    if (!token || !expiresAt) {
      return null;
    }

    if (Date.now() > parseInt(expiresAt)) {
      // Token expired
      this.logout();
      return null;
    }

    return token;
  }

  static logout(): void {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_expires_at');
    localStorage.removeItem('spotify_code_verifier');
  }

  static isLoggedIn(): boolean {
    return this.getAccessToken() !== null;
  }

  static async testConnection(): Promise<any> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return response.json();
  }

  static async fetchUserAlbums(): Promise<any[]> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const allAlbums: any[] = [];
    let url: string | null = 'https://api.spotify.com/v1/me/albums?limit=50';

    // TODO(human): Implement pagination loop
    while (url) {
      const partialResponse = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!partialResponse.ok) {
        throw new Error(`API call failed: ${partialResponse.status}`);
      }
      const data = await partialResponse.json();
      allAlbums.push(...data.items);
      url = data.next;
    }

    return allAlbums;
  }
}