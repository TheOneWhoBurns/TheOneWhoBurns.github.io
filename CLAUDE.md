# Album Shuffler

Spotify album shuffler web app hosted on GitHub Pages.

## Tech Stack

- React 19 with TypeScript
- Vite 6 (migrated from Create React App)
- Tailwind CSS v4 with Vite plugin

## Commands

- `npm run dev` - Start development server
- `npm run build` - TypeScript check + production build
- `npm run preview` - Preview production build

## Project Structure

- `src/main.tsx` - Entry point
- `src/App.tsx` - Main app component
- `src/components/` - React components
- `src/services/spotifyAuth.ts` - Spotify OAuth PKCE authentication
- `src/index.css` - Tailwind imports and custom theme
- `index.html` - Root HTML (Vite entry)
- `public/` - Static assets (icons, manifest)

## Tailwind v4 Configuration

Custom colors defined in `src/index.css` using `@theme` block:
- `spotify-green` (#1db954)
- `spotify-green-light` (#1ed760)

## GitHub Pages

Uses SPA redirect script in index.html for client-side routing support.

## Spotify Integration

OAuth PKCE flow for authentication. Requires Spotify Developer Dashboard app registration.
