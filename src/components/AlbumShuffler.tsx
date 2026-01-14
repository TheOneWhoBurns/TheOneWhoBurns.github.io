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
  { x: -140, scale: 0.6, opacity: 0.3, z: 1, rotateY: 15, shadow: 'shadow-lg' },
  { x: -80, scale: 0.75, opacity: 0.6, z: 2, rotateY: 8, shadow: 'shadow-xl' },
  { x: 0, scale: 1, opacity: 1, z: 5, rotateY: 0, shadow: 'shadow-2xl' },
  { x: 80, scale: 0.75, opacity: 0.6, z: 2, rotateY: -8, shadow: 'shadow-xl' },
  { x: 140, scale: 0.6, opacity: 0.3, z: 1, rotateY: -15, shadow: 'shadow-lg' },
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
  const [history, setHistory] = useState<QueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(2);
  const uidRef = useRef(0);
  const shuffleRef = useRef<boolean>(false);

  const queue = history.slice(Math.max(0, currentIndex - 2), currentIndex + 3);
  const queueOffset = Math.max(0, 2 - currentIndex);

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

    let newHistory = Array.from({ length: 5 }, () => createQueueItem(getRandomItem(pool)));
    let idx = 2;
    setHistory(newHistory);
    setCurrentIndex(idx);

    await new Promise(r => setTimeout(r, 100));

    for (let i = 0; i < 25 && shuffleRef.current; i++) {
      const newItem = createQueueItem(getRandomItem(pool));
      newHistory = [...newHistory, newItem];
      idx++;
      setHistory([...newHistory]);
      setCurrentIndex(idx);

      const delay = 80 + (i * i * 0.5);
      await new Promise(r => setTimeout(r, delay));
    }

    setSelectedItem(newHistory[idx].item);
    setIsShuffling(false);
    shuffleRef.current = false;
  };

  const handleSelectFromCarousel = (_queueItem: QueueItem, visualIndex: number) => {
    if (isShuffling) return;

    const actualIndex = visualIndex + queueOffset;
    if (actualIndex === 2) return;

    const shiftAmount = actualIndex - 2;

    if (shiftAmount < 0) {
      const newIndex = Math.max(2, currentIndex + shiftAmount);
      setCurrentIndex(newIndex);
      setSelectedItem(history[newIndex].item);
    } else {
      const pool = getItemPool();
      let newHistory = [...history];
      let newIndex = currentIndex + shiftAmount;

      while (newHistory.length < newIndex + 3) {
        newHistory = [...newHistory, createQueueItem(getRandomItem(pool))];
      }

      setHistory(newHistory);
      setCurrentIndex(newIndex);
      setSelectedItem(newHistory[newIndex].item);
    }
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
      <div className="flex justify-center gap-3">
        {(['albums', 'playlists', 'both'] as ShuffleMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setShuffleMode(mode)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              shuffleMode === mode
                ? 'neu-pressed text-spotify-green'
                : 'neu-raised text-white/70 hover:text-white'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      <div className="relative h-[280px] flex items-center justify-center" style={{ perspective: '1000px' }}>
        {queue.length > 0 ? (
          <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
            {queue.map((queueItem, index) => {
              const pos = POSITION_STYLES[index];
              const isCenter = index === 2;
              const isSelected = !isShuffling && selectedItem?.id === queueItem.item.id;

              return (
                <div
                  key={queueItem.uid}
                  onClick={() => handleSelectFromCarousel(queueItem, index)}
                  className={`absolute w-[160px] h-[160px] rounded-xl overflow-hidden transition-all duration-200 ease-out ${pos.shadow} ${
                    !isShuffling && !isCenter ? 'cursor-pointer hover:opacity-80' : ''
                  } ${isSelected && !isShuffling ? 'ring-2 ring-spotify-green' : ''}`}
                  style={{
                    transform: `translateX(${pos.x}px) scale(${pos.scale}) rotateY(${pos.rotateY}deg)`,
                    opacity: pos.opacity,
                    zIndex: pos.z,
                    transformStyle: 'preserve-3d',
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
          <div className="w-[200px] h-[200px] rounded-2xl neu-pressed flex items-center justify-center">
            <div className="text-center text-white/30">
              <svg className="w-14 h-14 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              <p className="text-sm">Hit shuffle to pick</p>
            </div>
          </div>
        )}
      </div>

      {selectedItem && !isShuffling && (
        <div className="text-center space-y-1.5 py-2">
          <h3 className="text-lg font-bold text-white/95 truncate px-4">
            {selectedItem.name}
          </h3>
          <p className="text-white/50 text-sm truncate px-4">
            {selectedItem.subtitle}
          </p>
        </div>
      )}

      {error && (
        <div className="neu-pressed rounded-xl px-4 py-3 text-red-400 text-sm text-center">
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
        <p className="text-white/40 text-sm text-center">
          Open Spotify on any device to enable playback
        </p>
      )}

      <div className="space-y-4">
        <button
          onClick={handleShuffle}
          disabled={isShuffling || poolSize === 0}
          className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 neu-raised-green text-black disabled:opacity-40 disabled:pointer-events-none"
        >
          {isShuffling ? 'Shuffling...' : `Shuffle (${poolSize})`}
        </button>

        <button
          onClick={handlePlay}
          disabled={!selectedItem || isPlaying || devices.length === 0 || isShuffling}
          className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 neu-raised text-white/90 disabled:opacity-30 disabled:pointer-events-none"
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
