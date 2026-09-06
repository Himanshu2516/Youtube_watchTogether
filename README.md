# YouTube Watch Party — Real-Time Synchronized Web App

A full-stack, real-time synchronized YouTube Watch Party application built with **React (Vite)**, **Node.js**, **Express**, and **Socket.IO**. Multiple users can watch YouTube videos together with synchronized play/pause/seek/change-video, room-based access via unique codes/links, and role-based access control (Host / Moderator / Participant).

---

## Live Demo

**App:** https://youtube-watchtogether-0unv.onrender.com

> Note: the backend is hosted on Render's free tier and sleeps after ~15 minutes of inactivity. The first load after idle time may take 30–60 seconds while it wakes up.

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
| Transfer host (manual + automatic on disconnect) | ✅ (bonus) |
| OOP structure (Room, Participant classes) | ✅ (bonus) |

---

## Project Structure

```
watch-party/
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
│   │   ├── models/
│   │   │   ├── Participant.js     # OOP class: role + permission methods
│   │   │   ├── Room.js            # OOP class: participants map + playback state
│   │   │   └── RoomManager.js     # Singleton managing all active in-memory rooms
│   │   ├── socket/
│   │   │   └── socketHandler.js   # All Socket.IO events + server-side RBAC checks
│   │   └── index.js               # Express + HTTP + Socket.IO server entry point
├── render.yaml                    # Render Blueprint for deployment
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite (plain JavaScript) |
| Backend | Node.js + Express |
| Realtime | Socket.IO |
| State storage | In-memory (per-room state managed by `RoomManager`) |
| Video | YouTube IFrame Player API |
| Deployment | Render |

> **Note on persistence:** This version stores all room, participant, and playback state in server memory for lowest possible sync latency. There is no database in the current deployment, so active rooms are cleared if the server restarts. Persisting room metadata (e.g. via MongoDB) is a natural next step and was considered but left out to keep the real-time path as simple and fast as possible for this submission.

---

## Local Setup & Run Instructions

### Prerequisites
- Node.js v18+
- npm

### 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

**`server/.env`:**
```env
PORT=5000
CLIENT_URL=http://localhost:5173
```

**`client/.env`:**
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

## Code Walkthrough Readiness

Be ready to explain, in your own words:
- **Socket.IO**: how `io.to(roomId).emit(...)` scopes broadcasts to a room, and why the server re-validates permissions on every event rather than trusting the client.
- **React**: how `SocketContext` + `useRoom` keep all room state derived purely from socket events (no client-side prediction beyond the anti-feedback-loop guard).
- **Express**: its role here is mostly serving as the HTTP server that Socket.IO attaches to.
- **RBAC logic**: the `Participant`/`Room`/`RoomManager` class design and why permission checks live on the server.
- **Deployment choices**: why the backend needs a persistent Web Service (not serverless) for WebSockets.
- **Trade-offs**: in-memory state (chosen for latency) vs. database persistence (a planned future improvement), and the host-disconnect policy.

---

## Known Limitations / Future Improvements

- Room and playback state resets if the server restarts (no database persistence yet).
- No authentication — users identify themselves with just a display name.
- No horizontal scaling support yet (single server instance; a Redis Pub/Sub adapter would be the next step for multi-instance deployments).

---

## License

MIT License.
