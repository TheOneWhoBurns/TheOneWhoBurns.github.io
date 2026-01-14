export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
}

export interface SpotifyAlbum {
  album: {
    id: string;
    name: string;
    uri: string;
    images: SpotifyImage[];
    artists: SpotifyArtist[];
    release_date: string;
    total_tracks: number;
  };
  added_at: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  uri: string;
  images: { url: string }[];
  owner: { display_name: string };
  tracks: { total: number };
}

export type ShuffleMode = 'albums' | 'playlists' | 'both';

export interface ShuffleItem {
  type: 'album' | 'playlist';
  id: string;
  name: string;
  uri: string;
  imageUrl: string;
  subtitle: string;
}
