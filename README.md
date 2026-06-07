# 🌌 MiniConnect - Premium Glassmorphic 3D Social Network

**MiniConnect** is an ultra-premium, full-stack, mobile-responsive social media application. Built with an industry-grade Model-View-Controller (MVC) architecture, it offers a stunning UI/UX designed with glassmorphism principles, interactive 3D card tilt physics, continuously moving neon ambient background animations, and fluid responsive layouts. 

The backend is engineered with **Node.js, Express, and MongoDB**, implementing secure, persistent session cookie authentication, real-time Socket.IO chat, Gemini AI integration, Chart.js analytics, and image uploads. The client-side features asynchronous (AJAX) interactions for seamless like particle explosions and comment additions.

---

## ✨ Features

### 🎨 Visual Aesthetics & UI/UX (Designer Tier)
1. **Glassmorphism Design**: Elegant translucent panels featuring high backdrop blurs (`backdrop-filter: blur(16px)`), soft lighting saturation, and micro-thin transparent borders.
2. **Interactive 3D Card Tilt**: Move your mouse across any card component. The card will dynamically rotate and tilt to follow your mouse cursor, and glide back to a flat position when you move your mouse away.
3. **True Parallax Depth**: Elements inside the cards (like the circular avatar rings, button components, and post images) have Z-axis offsets. When tilted, these elements visually float above the glass plane.
4. **Moving Ambient Background Blobs**: Renders 4 large glowing gradient spheres (purple, cyan, pink, and deep blue) which float and scale asynchronously using CSS `@keyframes` loops to produce a continuously morphing cosmic background.
5. **Movable Alerts Center**: A gorgeous neon floating notification drawer that is fully draggable via mouse or touch!
6. **Auto-Autoplay Stories Reel**: Horizontally scrollable stories that open a full-screen dynamic progress-bar viewer, which automatically advances after 4 seconds (Instagram inspired).
7. **Interactive Likes Explosion**: Custom JavaScript SVG particle bursts whenever a post is liked.

### 🔒 Secure Authentication Layer
- User registration and secure login with password hashing via `bcryptjs`.
- Cookie-based authentication tracking through `express-session`.
- **Persistent Sessions**: Powered by `connect-mongo` to keep users logged in even across server sleep cycles (perfect for Render's free tier). Fallbacks dynamically to Express memory sessions when running completely offline.

### 📝 Content & Social Interactions
- Rich post composer supporting both text thoughts and image media uploads using **Multer**.
- Asynchronous AJAX likes and comments rendering instantly without interrupting the user's feed with page reloads.
- **Follow/Unfollow System**: Connect with creators directly from profile pages or recommendations panels (`POST /follow/:userId`).
- **Post Bookmarking**: Save creations with one click (`POST /bookmark/:postId`) and access them in your dedicated `/saved-posts` dashboard.
- **Feed Stats**: Tracks and displays view counts per post dynamically.
- Secure post removal with account-ownership checks at the database level.
- Interactive profile galleries with a square grid layout, displaying overlays of like/comment counts on hover.
- Editable bios and customizable avatar pictures.

### 💬 Advanced Chat Module (`/chat`)
- **Real-Time Communication**: Multi-user chat powered by Socket.IO.
- **Rich Messaging**: Supports text messages, typing indicators, read receipts, image uploads, and online/offline status indicators.

### 🤖 AI Caption Generator
- **Gemini AI Integration**: Generate creative post captions inside the composer dynamically (`POST /api/ai/generate-caption`).
- **Built-in Fallbacks**: If no Gemini API key is configured, the application falls back gracefully to beautiful template captions automatically.

### 📊 Analytics Dashboard (`/dashboard`)
- Comprehensive activity tracking dashboard rendered with **Chart.js**.
- Displays post engagement metrics, like-to-comment ratios, follower growth, and viewer statistics.

---

## 📁 Directory Structure

```
C:\Mini-connet-code-alpha\
├── .env                  # Environment configuration settings
├── .env.example          # Sample environment variables
├── package.json          # Node modules, dependencies & run scripts
├── server.js             # Express application root initialization
├── config/
│   ├── db.js             # Mongoose connection settings & auto-seeding engine
│   ├── mockDb.js         # Offline sandbox fallback database proxy
│   └── socket.js         # Socket.IO configurations for chat
├── controllers/
│   ├── analyticsController.js # Analytics metrics aggregator
│   ├── authController.js # Signup, Login, and Logout handlers
│   ├── bookmarkController.js # Post saving controls
│   ├── captionController.js # Gemini AI caption generation handler
│   ├── chatController.js # Messaging records fetchers
│   ├── followController.js # Social connections managers
│   ├── notificationController.js # Alert trackers
│   ├── postController.js # Feed loader, likes, comments, and deletion logic
│   ├── searchController.js # User query handlers
│   └── userController.js # User profiles, bio edits, and search algorithms
├── middleware/
│   ├── auth.js           # Auth guard filters
│   ├── errorHandler.js   # Server error capture middleware
│   ├── rateLimiter.js    # API abuse prevention
│   └── upload.js         # Multer image storage settings
├── models/
│   ├── User.js           # User schema (Username, hashed password, bio, avatar)
│   ├── Post.js           # Post schema (Author, text, image, likes array, views)
│   ├── Comment.js        # Comment schema (Post, Author, content, timestamps)
│   ├── Message.js        # Chat message records
│   ├── Notification.js   # Event triggers
│   └── Bookmark.js       # Bookmarked post links
├── public/
│   ├── css/
│   │   └── style.css     # Premium UI styling tokens, variables, & responsive grid layouts
│   ├── js/
│   │   ├── main.js       # Client interaction script (likes, comments, dragging, stories, tilt)
│   │   ├── chat.js       # Socket.IO client-side handler
│   │   └── dashboard.js  # Chart.js initialization script
│   └── images/
│       └── default-avatar.svg # Glowing vector avatar placeholder
├── routes/
│   ├── authRoutes.js     # Auth endpoint handlers
│   ├── indexRoutes.js    # Root feed routing
│   ├── postRoutes.js     # Post interaction triggers
│   └── userRoutes.js     # User profile controls
└── views/
    ├── partials/
    │   ├── header.ejs    # Global header navigation, ambient blobs, and style imports
    │   ├── sidebar.ejs   # Left panel glass menus
    │   ├── right-sidebar.ejs # Right panel search & follow recommendations
    │   └── footer.ejs    # Floating panels, modal viewer overlays, and client scripts
    ├── feed.ejs          # Home timeline feed
    ├── profile.ejs       # Creator gallery grids & profile panels
    ├── create-post.ejs   # Mobile-responsive dedicated publisher
    ├── chat.ejs          # Real-time message viewport
    ├── dashboard.ejs     # Activity metrics charts
    ├── login.ejs         # Glass login gate
    ├── register.ejs      # Glass registration gate
    ├── 404.ejs           # Lost coordinate page
    └── 500.ejs           # Core server breakdown page
```

---

## 🛠️ Local Installation & Development

### Prerequisites
- **Node.js** (v16.0.0 or higher recommended)
- **MongoDB** (Optional: Local Community Server running, or a MongoDB Atlas cloud URI. If offline, the sandbox will run automatically!)

### Steps

1. **Clone or Navigate to the Workspace Directory**
   Ensure all files are placed in the directory: `C:\Mini-connet-code-alpha`.

2. **Configure Environment Settings**
   Copy `.env.example` to `.env` and fill in the parameters:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/miniconnect
   SESSION_SECRET=miniconnect_neon_super_secret_key_12345
   NODE_ENV=development
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-1.5-flash
   ```
   *Note:* Get your Gemini API Key at [Google AI Studio](https://aistudio.google.com/apikey).

3. **Install Dependencies**
   Run the package installer from your terminal:
   ```bash
   npm install
   ```

4. **Launch the Development Server**
   Start the application with standard auto-restart monitoring using Nodemon:
   ```bash
   npm run dev
   ```

5. **Explore the Application**
   Open your browser and navigate to: `http://localhost:3000`.
   - **Database offline?** The app automatically switches to an in-memory mock database sandbox!
   - **No Gemini key?** AI captions will use beautiful fallback templates automatically.
   - The system will **automatically seed** several high-quality dummy posts and users on the first load!
   - You can log in using one of the pre-loaded creator accounts (password: `password123`):
     - `alex_cosmos`
     - `elena_pixels`
     - `neon_coder`
     - `synth_clara`

---

## 🚀 Deployment Instructions (Render + MongoDB Atlas)

MiniConnect is pre-configured and 100% deployment-ready for hosting platforms like **Render**.

### Step 1: Set up MongoDB Atlas Cloud Cluster
1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Deploy a new Shared Cluster (M0 Free Tier).
3. Under **Network Access**, allow IP access (add `0.0.0.0/0` for cloud environments).
4. Under **Database Access**, create a user with read/write privileges.
5. Copy your **MongoDB Connection URI String**.

### Step 2: Deploy on Render
1. Push the code to a repository on **GitHub**.
2. Log into the [Render Dashboard](https://dashboard.render.com).
3. Create a **New Web Service** and link it to your GitHub repository.
4. Set the following configurations:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Advanced** to add the following **Environment Variables**:
   - `MONGODB_URI` = *Your MongoDB Atlas connection URI string*
   - `SESSION_SECRET` = *A custom long random string*
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = *Your Gemini API key*
6. Click **Deploy Web Service**! Render will build your dependencies, boot the server, connect securely to your MongoDB Atlas cloud database, auto-seed the premium content, and launch the site live!

---

## ⚙️ Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Port 3000 in use | The previous server process didn't terminate fully | Run `npx kill-port 3000` then restart with `npm run dev` |
| Local database fails | MongoDB local service is not running | The app automatically triggers sandbox mode. Alternatively, paste your MongoDB Atlas URI in `.env` |
| AI returns default captions | Missing or invalid Gemini API Key | Add a valid `GEMINI_API_KEY` to `.env` and restart the server |
| Chat not connecting | `socket.io` is blocked | Confirm `socket.io` is loaded and your network allows WebSocket connections |
