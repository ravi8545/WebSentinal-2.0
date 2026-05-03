# WebSentinal — Frontend

Modern SaaS landing page + auth UI for **WebSentinal** (Smart Website Monitoring Platform).

## Tech Stack

- React (Vite)
- SCSS (Sass)
- React Icons

## Getting Started

From this folder:

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Build for production: `npm run build`
4. Preview production build: `npm run preview`

Dev server runs on `http://localhost:5173`.

## Project Structure

`src/` follows a simple 4-layer architecture:

- `pages/` — route-level pages (LandingPage)
- `components/` — reusable UI sections (Navbar, Hero, AuthCard, Features, Companies, Footer)
- `services/` — placeholder service layer (authService)
- `utils/` — constants and shared helpers

Styling lives in `src/styles/`:

- `main.scss` (global entry)
- `variables.scss` (theme tokens)
- `mixins.scss` (reusable patterns)
- `components/` and `pages/` (scoped styles)
