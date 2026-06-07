# MiniConnect — Feature Integration Guide

## Quick Start

```bash
npm install
npm run dev
```

Open **http://localhost:3000** and log in with a demo account:

| Username | Password |
|----------|----------|
| `alex_cosmos` | `password123` |
| `elena_pixels` | `password123` |

---

## Environment Variables

Copy `.env.example` to `.env`:

```
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/miniconnect
SESSION_SECRET=your_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

- **MongoDB offline?** The app falls back to an in-memory mock database automatically.
- **No Gemini key?** AI captions use built-in fallback templates.

Get a Gemini API key: https://aistudio.google.com/apikey

---

## Features

### Core (7 features)
- **Follow/Unfollow** — Profile page + sidebar suggestions (`POST /follow/:userId`)
- **Edit/Delete posts** — Post owner actions on feed cards
- **Bookmarks** — Save posts (`POST /bookmark/:postId`), view at `/saved-posts`
- **Notifications** — `/notifications` with unread badges
- **Search** — `/search` + live dropdown in right sidebar
- **Feed stats** — View counts tracked per post
- **Real-time chat** — `/chat` with Socket.IO

### Advanced (3 features)
- **AI Caption Generator** — `POST /api/ai/generate-caption` (feed composer + create-post page)
- **Enhanced chat** — Typing indicators, read receipts, image upload, online status
- **Analytics Dashboard** — `/dashboard` with Chart.js charts

---

## Routes Reference

| Route | Description |
|-------|-------------|
| `/` | Feed |
| `/dashboard` | Analytics dashboard |
| `/chat` | Messages |
| `/saved-posts` | Bookmarked posts |
| `/notifications` | Notifications |
| `/search` | Full search page |
| `/api/ai/generate-caption` | AI caption API (auth required) |

---

## Testing Checklist

1. Login → feed loads without 500 error
2. Right sidebar shows 6+ creator suggestions with working Follow buttons
3. Search dropdown appears above suggestions (not hidden behind)
4. AI Caption button opens modal, generates captions (with or without Gemini key)
5. Dashboard charts render at `/dashboard`
6. Chat: send message, typing indicator, image upload, read receipts
7. Follow, bookmark, notifications still work

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 3000 in use | `npx kill-port 3000` then `npm run dev` |
| 500 on feed | Ensure only one server instance; hard refresh (`Ctrl+Shift+R`) |
| AI returns fallback captions | Add `GEMINI_API_KEY` to `.env` and restart |
| Chat not connecting | Confirm `socket.io` is installed and server shows no Socket.IO warnings |
