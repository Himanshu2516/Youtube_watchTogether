# YouTube Watch Party — Real-Time Synchronized Web App

A full-stack, real-time synchronized YouTube Watch Party application built with **React (Vite)**, **Node.js**, **Express**, **Socket.IO**, and **MongoDB (Mongoose)**. Multiple users can watch YouTube videos together with synchronized play/pause/seek/change-video, room-based access via unique codes/links, and role-based access control (Host / Moderator / Participant).

This README covers the deliverables required for the assignment: setup & run instructions, the live deployment URL, an architecture overview of how WebSockets integrate with the app, and a code walkthrough guide.

---

## Live Deployment

- **Frontend App:** `https://<your-client-app>.onrender.com`
- **Backend WebSocket Server:** `https://<your-server-app>.onrender.com`

> Replace both URLs above with your actual Render (or Vercel/Railway) URLs after deployment.

---

## Core Requirements Covered

| Requirement | Status |
|---|---|
| Real-time synchronization (play/pause/seek/video change) | ✅ |
| Room-based model (create/join via unique code or link) | ✅ |
| YouTube integration via IFrame Player API | ✅ |
| WebSockets (Socket.IO) for all real-time communication | ✅ |
| Role-based access control (Host / Moderator / Participant) | ✅ |
| Backend permission validation before processing events | ✅ |
| Broadcast role updates to the room | ✅ |
| Basic chat | ✅ (bonus) |
| Emoji reactions | ✅ (bonus) |
| Persistent room metadata (MongoDB) | ✅ (bonus, with in-memory fallback) |
| Host transfer (manual + automatic on disconnect) | ✅ (bonus) |

---

## Project Structure

```
Web3task_task/
├── client/                        # React + Vite frontend (plain JavaScript)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.jsx           # Real-time room chat
│   │   │   ├── Header.jsx         # Room code / share / role indicator
│   │   │   ├── ParticipantList.jsx# Live user list + role badges + host actions
│   │   │   ├── Player.jsx         # YouTube IFrame API wrapper + anti-feedback-loop guard
│   │   │   ├── Reactions.jsx      # Floating emoji reactions
│   │   │   ├── RoomControls.jsx   # Play/pause/seek controls, role-gated
│   │   │   ├── Toast.jsx          # Error/notification toasts (e.g. permission denied)
│   │   │   └── UrlInputForm.jsx   # Paste YouTube URL to change video
│   │   ├── context/
│   │   │   └── SocketContext.jsx  # Socket.IO connection provider
│   │   ├── hooks/
│   │   │   └── useRoom.js         # Room state hook (participants, role, playback state)
│   │   ├── pages/
│   │   │   ├── HomePage.jsx       # Create / join room
│   │   │   └── RoomPage.jsx       # Main watch party screen
│   │   ├── utils/
│   │   │   └── youtube.js         # YouTube URL → video ID parser
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── server/                        # Express + Socket.IO backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection (graceful fallback if unset)
│   │   ├── models/
│   │   │   ├── Participant.js     # OOP class: role + permission methods
│   │   │   ├── Room.js            # OOP class: participants map + playback state
│   │   │   ├── RoomManager.js     # Singleton managing all active in-memory rooms
│   │   │   └── MongoRoom.js       # Mongoose schema for room metadata persistence
│   │   ├── socket/
│   │   │   └── socketHandler.js   # All Socket.IO events + server-side RBAC checks
│   │   └── index.js               # Express + HTTP + Socket.IO server entry point
│   └── .env.example
├── render.yaml                    # Render Blueprint for one-click deployment
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite (plain JavaScript) |
| Backend | Node.js + Express |
| Realtime | Socket.IO |
| Database | MongoDB via Mongoose (optional — in-memory fallback if `MONGODB_URI` is unset) |
| Video | YouTube IFrame Player API |
| Deployment | Render (backend as Web Service, frontend as Static Site) |

---

## Local Setup & Run Instructions

### Prerequisites
- Node.js v18+
- npm
- (Optional) A MongoDB connection string — local MongoDB or a free MongoDB Atlas cluster

### 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

**`server/.env`** (copy from `server/.env.example`):
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/watchparty
```
If `MONGODB_URI` is left blank, the server runs entirely in-memory — room/playback sync still works, only persistence across restarts is lost.

**`client/.env`** (optional for local dev, required for deployment):
```env
VITE_SERVER_URL=http://localhost:5000
```

### 3. Run the app

In two separate terminals:
```bash
# Terminal 1
cd server && npm run dev      # http://localhost:5000

# Terminal 2
cd client && npm run dev      # http://localhost:5173
```

Open `http://localhost:5173` in two or more browser tabs to test multi-user sync, roles, chat, and reactions.

---

## Architecture Overview — How WebSockets Power the App

The Express server is the **single source of truth** for every room. Clients never trust their own local state — they always wait for the server to confirm and broadcast it.

1. **Connect & Join** — On `join_room`, the server creates or looks up a `Room` (via `RoomManager`), builds a `Participant` for the socket (Host if the room is new, Participant otherwise), and immediately sends the joiner the current `sync_state` so there's no flash of default state.
2. **Action → Validate → Broadcast** — For every playback action (`play`, `pause`, `seek`, `change_video`), the client emits the event; the server looks up the sender's `Participant`, calls `canControlPlayback()`, and only if authorized does it update the `Room`'s in-memory state and broadcast `sync_state` to everyone in the room (including the sender). Unauthorized attempts get an `error` event back, not silence.
3. **Role management** — `assign_role` and `remove_participant` follow the same pattern but check `canManageRoom()` (Host-only), then broadcast `role_assigned` / `participant_removed` with the updated participant list.
4. **Anti-feedback-loop guard** — When a client's `Player.jsx` applies an incoming `sync_state` to the YouTube IFrame player, it sets an `isServerUpdate` ref flag before calling `seekTo()`/`playVideo()`/`pauseVideo()`. The player's own `onStateChange` callback checks this flag and ignores the event if it was server-triggered, preventing an infinite emit loop.
5. **Drift correction** — Clients periodically compare their local playback time to the server's last known `currentTime` (adjusted for elapsed time); if drift exceeds ~1.5 seconds, the client silently reseeks without emitting a new event.
6. **Disconnect handling** — On `disconnect`, the participant is removed from the `Room`; if they were Host, the role auto-transfers to the longest-connected remaining participant. If the room becomes empty, it's deleted from memory.

---

## Role-Based Access Control

| Role | Assigned by | Permissions |
|---|---|---|
| Host | Automatic (room creator) | Full control: play/pause, seek, change video, assign roles, remove participants, transfer host |
| Moderator | Host | Play/pause, seek, change video |
| Participant | Host (default for joiners) | Watch only |

Enforcement happens **server-side**, not just in the UI:
```js
const { room, participant } = getContext(socket);
if (!participant.canControlPlayback()) {
  return socket.emit('error', { message: 'Permission denied: Host or Moderator required' });
}
```
The frontend also disables controls visually for unauthorized roles, but that's a UX convenience — the real enforcement is the check above, since a client could otherwise emit raw socket events from the browser console.

---

## Deployment Guide (Render)

1. Push the repository to GitHub.
2. Create a MongoDB Atlas free-tier cluster (or skip this for in-memory-only mode) and copy its connection string.
3. On Render, deploy `server/` as a **Web Service** (Build: `npm install`, Start: `node src/index.js`). Add environment variables `MONGODB_URI` and `CLIENT_URL`.
4. Deploy `client/` as a **Static Site** (Build: `npm run build`, Publish directory: `dist`). Set `VITE_SERVER_URL` to the backend's Render URL before building.
5. Update the backend's `CLIENT_URL` to the frontend's live URL, then redeploy the backend so CORS/Socket.IO origin checks pass.
6. Test in two browser tabs against the live URLs to confirm sync, roles, chat, and reactions all work in production.

(Alternatively, use the included `render.yaml` to deploy both services as a single Render Blueprint.)

---

## Code Walkthrough Readiness

Be ready to explain, in your own words:
- **Socket.IO**: how `io.to(roomId).emit(...)` scopes broadcasts to a room, and why the server re-validates permissions on every event rather than trusting the client.
- **React**: how `SocketContext` + `useRoom` keep all room state derived purely from socket events (no client-side prediction beyond the anti-feedback-loop guard).
- **Express**: its role here is mostly serving as the HTTP server that Socket.IO attaches to, plus any REST routes you added for room lookup.
- **RBAC logic**: the `Participant`/`Room`/`RoomManager` class design and why permission checks live on the server.
- **Deployment choices**: why the backend needs a persistent Web Service (not serverless) for WebSockets, and how env vars connect the two deployed services.
- **Trade-offs**: in-memory state vs. MongoDB persistence, the host-disconnect policy, and any sync edge cases you hit while building.

---

## License

MIT License.