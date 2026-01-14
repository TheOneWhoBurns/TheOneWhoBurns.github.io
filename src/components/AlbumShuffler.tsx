import { useState, useEffect, useCallback, useRef } from 'react';
import { SpotifyAuth } from '../services/spotifyAuth';
import { SpotifyDevice, SpotifyAlbum, SpotifyPlaylist, ShuffleMode, ShuffleItem } from '../types/spotify';
import DeviceSelector from './DeviceSelector';

interface Props {
  albums: SpotifyAlbum[];
  playlists: SpotifyPlaylist[];
}

interface QueueItem {
  uid: number;
  item: ShuffleItem;
}

function normalizeItem(item: SpotifyAlbum | SpotifyPlaylist, type: 'album' | 'playlist'): ShuffleItem {
  if (type === 'album') {
    const album = (item as SpotifyAlbum).album;
    return {
      type: 'album',
      id: album.id,
      name: album.name,
      uri: album.uri,
      imageUrl: album.images[0]?.url || '',
      subtitle: album.artists.map(a => a.name).join(', '),
    };
  } else {
    const playlist = item as SpotifyPlaylist;
    return {
      type: 'playlist',
      id: playlist.id,
      name: playlist.name,
      uri: playlist.uri,
      imageUrl: playlist.images[0]?.url || '',
      subtitle: `${playlist.tracks.total} tracks`,
    };
  }
}

const POSITION_STYLES = [
  { x: -140, scale: 0.6, opacity: 0.3, z: 1 },
  { x: -80, scale: 0.75, opacity: 0.6, z: 2 },
  { x: 0, scale: 1, opacity: 1, z: 5 },
  { x: 80, scale: 0.75, opacity: 0.6, z: 2 },
  { x: 140, scale: 0.6, opacity: 0.3, z: 1 },
];

export default function AlbumShuffler({ albums, playlists }: Props) {
  const [shuffleMode, setShuffleMode] = useState<ShuffleMode>('albums');
  const [selectedItem, setSelectedItem] = useState<ShuffleItem | null>(null);
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isShuffling, setIsShuffling] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const uidRef = useRef(0);
  const shuffleRef = useRef<boolean>(false);

  const fetchDevices = useCallback(async () => {
    setIsLoadingDevices(true);
    try {
      const devs = await SpotifyAuth.getDevices();
      setDevices(devs);
      const active = devs.find(d => d.is_active);
      if (active && !selectedDeviceId) {
        setSelectedDeviceId(active.id);
      }
    } catch {
      setDevices([]);
    } finally {
      setIsLoadingDevices(false);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const getItemPool = useCallback((): ShuffleItem[] => {
    const pool: ShuffleItem[] = [];
    if (shuffleMode === 'albums' || shuffleMode === 'both') {
      pool.push(...albums.map(a => normalizeItem(a, 'album')));
    }
    if (shuffleMode === 'playlists' || shuffleMode === 'both') {
      pool.push(...playlists.map(p => normalizeItem(p, 'playlist')));
    }
    return pool;
  }, [shuffleMode, albums, playlists]);

  const createQueueItem = (item: ShuffleItem): QueueItem => ({
    uid: uidRef.current++,
    item,
  });

  const getRandomItem = (pool: ShuffleItem[]): ShuffleItem => {
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleShuffle = async () => {
    const pool = getItemPool();
    if (pool.length === 0) return;

    setIsShuffling(true);
    shuffleRef.current = true;
    setError(null);
    setSelectedItem(null);

    let currentQueue = Array.from({ length: 5 }, () => createQueueItem(getRandomItem(pool)));
    setQueue(currentQueue);

    await new Promise(r => setTimeout(r, 100));

    for (let i = 0; i < 25 && shuffleRef.current; i++) {
      const newItem = createQueueItem(getRandomItem(pool));
      currentQueue = [...currentQueue.slice(1), newItem];
      setQueue([...currentQueue]);

      const delay = 80 + (i * i * 0.5);
      await new Promise(r => setTimeout(r, delay));
    }

    const centerItem = currentQueue[2].item;
    setSelectedItem(centerItem);
    setIsShuffling(false);
    shuffleRef.current = false;
  };

  const handleSelectFromCarousel = (queueItem: QueueItem) => {
    if (isShuffling) return;
    setSelectedItem(queueItem.item);
  };

  const handlePlay = async () => {
    if (!selectedItem) return;

    setIsPlaying(true);
    setError(null);

    try {
      const shouldShuffle = selectedItem.type === 'playlist';
      await SpotifyAuth.startPlayback(selectedItem.uri, selectedDeviceId || undefined, shouldShuffle);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Playback failed');
    } finally {
      setIsPlaying(false);
    }
  };

  const poolSize = getItemPool().length;

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="flex justify-center gap-2">
        {(['albums', 'playlists', 'both'] as ShuffleMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setShuffleMode(mode)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              shuffleMode === mode
                ? 'bg-spotify-green text-black'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      <div className="relative h-[280px] flex items-center justify-center">
        {queue.length > 0 ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {queue.map((queueItem, index) => {
              const pos = POSITION_STYLES[index];
              const isCenter = index === 2;
              const isSelected = !isShuffling && selectedItem?.id === queueItem.item.id;

              return (
                <div
                  key={queueItem.uid}
                  onClick={() => handleSelectFromCarousel(queueItem)}
                  className={`absolute w-[160px] h-[160px] rounded-xl overflow-hidden shadow-2xl transition-all duration-200 ease-out ${
                    !isShuffling && !isCenter ? 'cursor-pointer hover:opacity-80' : ''
                  } ${isSelected && !isShuffling ? 'ring-2 ring-spotify-green' : ''}`}
                  style={{
                    transform: `translateX(${pos.x}px) scale(${pos.scale})`,
                    opacity: pos.opacity,
                    zIndex: pos.z,
                  }}
                >
                  <img
                    src={queueItem.item.imageUrl}
                    alt={queueItem.item.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && !isShuffling && (
                    <div className="absolute -bottom-1 -right-1 bg-spotify-green text-black text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                      {queueItem.item.type}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-[200px] h-[200px] rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center">
            <div className="text-center text-white/40">
              <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              <p>Hit shuffle to pick</p>
            </div>
          </div>
        )}
      </div>

      {selectedItem && !isShuffling && (
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-white truncate px-4">
            {selectedItem.name}
          </h3>
          <p className="text-white/60 text-sm truncate px-4">
            {selectedItem.subtitle}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-3 text-red-200 text-sm text-center">
          {error}
        </div>
      )}

      <DeviceSelector
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        onSelect={setSelectedDeviceId}
        onRefresh={fetchDevices}
        isLoading={isLoadingDevices}
      />

      {devices.length === 0 && !isLoadingDevices && (
        <p className="text-white/50 text-sm text-center">
          Open Spotify on any device to enable playback
        </p>
      )}

      <div className="space-y-3">
        <button
          onClick={handleShuffle}
          disabled={isShuffling || poolSize === 0}
          className="w-full py-4 rounded-full font-bold text-lg transition-all bg-gradient-to-r from-spotify-green to-spotify-green-light text-black hover:scale-[1.02] hover:shadow-lg hover:shadow-spotify-green/30 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          {isShuffling ? 'Shuffling...' : `Shuffle (${poolSize})`}
        </button>

        <button
          onClick={handlePlay}
          disabled={!selectedItem || isPlaying || devices.length === 0 || isShuffling}
          className="w-full py-4 rounded-full font-bold text-lg transition-all bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40 disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:border-white/20"
        >
          {isPlaying ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Starting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Play on Spotify
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
