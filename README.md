# Tripnest

Plan · Explore · Make Memories.

A full-stack trip planning app: day-by-day itineraries, an interactive map of
saved places, a real budget tracker with currency conversion, transportation
and accommodation logs, a packing list, and shared trips with live chat and
polls.

## Stack

| Layer     | Choice                                                        | Why |
|-----------|----------------------------------------------------------------|-----|
| Frontend  | React 18 + Vite + Tailwind CSS                                 | Fast dev server, single-command start, small bundle |
| Backend   | Express + Socket.IO                                             | REST for CRUD, sockets for live itinerary/chat/poll sync |
| Database  | MongoDB Atlas (free tier)                                       | Generous free tier, pure-JS driver (no native build deps — works in Termux) |
| Maps      | Leaflet + OpenStreetMap tiles                                   | Free, no API key |
| Geocoding | Nominatim (OpenStreetMap)                                       | Free, no API key — see note below on production use |
| Currency  | Frankfurter.app                                                 | Free, no API key, no rate limit for reasonable use |
| Auth      | JWT + bcrypt                                                     | Simple, stateless, no extra service |

Everything above is free-tier. No paid API keys are required to run this project.

## Project structure

```
tripnest/
  server/            Express + Socket.IO API
    src/
      config/db.js       MongoDB connection
      models/            User, Trip, ChatMessage, Poll
      routes/            auth, trips (+itinerary/places/budget/etc.), chat, polls
      middleware/auth.js JWT auth guard + trip-membership guard
      sockets/           Socket.IO room handling
      index.js           App entrypoint
  client/            React + Vite frontend
    src/
      pages/             Landing, Login, Signup, Dashboard, TripCreate, TripDetail
      pages/tabs/        Itinerary, Map, Budget, Transport, Accommodation, Packing, Chat, Stats
      components/        Navbar, TripCard, icon set, hero illustration
      context/           Auth state
      hooks/useSocket.js Real-time trip room subscription
```

The `Trip` document embeds its itinerary, saved places, budget, transportation,
accommodation, and packing list as subdocuments — one document per trip holds
(almost) everything, which keeps the API small. Chat messages and polls are
separate collections since they grow continuously.

## Running it locally (single command)

You need Node.js 18+ and a free MongoDB Atlas cluster.

1. **Create a free MongoDB Atlas cluster**: https://www.mongodb.com/cloud/atlas/register
   → create a database user → get your connection string (it looks like
   `mongodb+srv://user:pass@cluster.mongodb.net/tripnest`) → in Atlas's Network
   Access tab, allow access from anywhere (`0.0.0.0/0`) if you're developing
   from a phone/Termux with a changing IP.

2. **Configure the server:**
   ```bash
   cp server/.env.example server/.env
   # edit server/.env and paste in your MONGODB_URI and a random JWT_SECRET
   ```

3. **Install everything and start both apps with one command:**
   ```bash
   npm run install:all
   npm run dev
   ```
   This starts the API on `http://localhost:5000` and the client on
   `http://localhost:5173` (the client proxies `/api` and `/socket.io` to the
   server automatically — no CORS headaches in dev).

4. Open `http://localhost:5173`, sign up, and start planning.

### Running in Termux

Same steps as above. The stack was chosen specifically to avoid native
database dependencies (e.g. no local MongoDB binary, no `better-sqlite3`) —
Atlas is a hosted service, so there's nothing to compile on-device.

## Deployment (free tier)

- **Server → Render**: create a new Web Service from your repo's `server/`
  folder, build command `npm install`, start command `npm start`, and set the
  `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN` (your Vercel/Netlify URL)
  environment variables in Render's dashboard.
- **Client → Vercel or Netlify**: deploy the `client/` folder. Before
  building, either set an env-based API URL or add a rewrite/proxy rule
  pointing `/api` and `/socket.io` at your Render URL (both platforms support
  this in their config files).
- **Keep the server warm**: Render's free tier sleeps after inactivity. Point
  [UptimeRobot](https://uptimerobot.com) at `https://your-api.onrender.com/api/health`
  every 5 minutes to avoid cold starts.

## What's implemented vs. left for you to extend

**Fully working:** auth, trip CRUD, day-by-day itinerary with drag-to-reorder,
map with search/save/route, budget with per-category planning + expense log +
live currency conversion, transportation log, accommodation log, packing list,
trip invite links, real-time chat, real-time polls/voting, and a stats recap
tab.

**Intentionally left as good starting points, not fully built:**
- **Push notifications** ("Flight in 3 hours", "80% of budget used") — the
  data needed for all of these already lives on the trip document (departure
  times, budget totals, packing completion), but wiring up actual push
  notifications needs a service worker + the Web Push API (VAPID keys) or a
  mobile wrapper, which is a separate, fairly involved piece of infrastructure.
  A good next step: a `NotificationCenter` component that computes these from
  the trip data client-side and shows them as in-app banners, before tackling
  real push.
- **Cover photo upload** — `coverPhoto` currently accepts a URL string. Real
  image upload needs object storage (Cloudinary's free tier is a good fit and
  needs no server-side native deps).
- **Offline access** — the brand kit mentions this; turning the client into a
  PWA (a manifest + service worker caching the app shell) is additive and
  doesn't require restructuring anything above.
- **Fine-grained permissions** — every trip member can currently edit
  everything (matches the "everyone can edit" spec). Splitting owner-only
  actions further (e.g. only the owner can remove other members) is a small
  addition to `middleware/auth.js`.

## Notes on the free APIs

- **Nominatim** (place search) is called directly from the browser for
  simplicity. Its usage policy asks for a descriptive `User-Agent` and light
  request volume — fine for personal/small-scale use as-is; for heavier
  traffic, proxy the search through your Express server instead.
- **Frankfurter** has no published rate limit for normal use and needs no key.
