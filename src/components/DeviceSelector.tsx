import { SpotifyDevice } from '../types/spotify';

interface Props {
  devices: SpotifyDevice[];
  selectedDeviceId: string;
  onSelect: (deviceId: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function DeviceSelector({ devices, selectedDeviceId, onSelect, onRefresh, isLoading }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 relative">
        <select
          value={selectedDeviceId}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 pr-10 text-white appearance-none cursor-pointer hover:border-spotify-green/50 focus:border-spotify-green focus:outline-none transition-colors"
        >
          <option value="">Select a device...</option>
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name} {device.is_active ? '(Active)' : ''}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/60">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="p-3 bg-black/50 border border-white/20 rounded-lg text-white hover:border-spotify-green/50 hover:text-spotify-green transition-all disabled:opacity-50"
      >
        <svg
          className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
}
