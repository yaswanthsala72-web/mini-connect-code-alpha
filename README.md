# 🌌 MiniConnect - Premium Glassmorphism Social Network

**MiniConnect** is an ultra-premium, full-stack, mobile-responsive social media application. Built with an industry-grade Model-View-Controller (MVC) architecture, it offers a stunning UI/UX designed with glassmorphism principles, custom neon glow highlights, dynamic dark/light theme options, and fluid animations. 

The backend is engineered with **Node.js, Express, and MongoDB**, implementing secure, persistent session cookie authentication and image uploads. The client-side features asynchronous (AJAX) interactions for seamless like particle explosions and comment additions.

---

## ✨ Features

1. **🔒 Secure Authentication Layer**
   - User registration and secure login with password hashing via `bcryptjs`.
   - Cookie-based authentication tracking through `express-session`.
   - **Persistent Sessions**: Powered by `connect-mongo` to keep users logged in even across server sleep cycles (perfect for Render's free tier).

2. **🌌 Visual Aesthetics (UI/UX Designer Tier)**
   - Elegant **Glassmorphism Design** featuring high backdrop blurs, soft lighting saturation, and micro-thin transparent borders.
   - **Movable Alerts Center**: A gorgeous neon floating notification drawer that is fully draggable via mouse or touch!
   - **Auto-Autoplay Stories Reel**: Horizontally scrollable stories that open a full-screen dynamic progress-bar viewer, which automatically advances after 4 seconds (Instagram inspired).
   - **Interactive Likes Explosion**: Custom JavaScript SVG particle bursts whenever a post is liked.

3. **📝 Content & Social Interactions**
   - Rich post composer supporting both text thoughts and image media uploads using **Multer**.
   - Asynchronous AJAX likes and comments rendering instantly without interrupting the user's feed with page reloads.
   - Secure post removal with account-ownership checks at the database level.
   - Interactive profile galleries with a square grid layout, displaying overlays of like/comment counts on hover.
   - Editable bios and customizable avatar pictures.

4. **🔍 Real-Time Search**
   - Debounced search engine in the right widget panel that queries user databases instantly and populates results inside a floating glass panel.

5. **⚡ Auto-Seeding Engine**
   - Preloads the database automatically on the first launch with premium mockup accounts, high-fidelity post photography, and realistic chat comments so the application feels alive immediately.

---

## 📁 Directory Structure

```
c:\Mini connet code alpha\
├── .env                  # Environment configuration settings
├── .env.example          # Sample environment variables
├── package.json          # Node modules, dependencies & run scripts
├── server.js             # Express application root initialization
├── config/
│   └── db.js             # Mongoose connection settings & auto-seeding engine
├── controllers/
│   ├── authController.js # Signup, Login, and Logout handlers
│   ├── postController.js # Feed loader, likes, comments, and deletion logic
│   └── userController.js # User profiles, bio edits, and search algorithms
├── middleware/
│   ├── auth.js           # Auth guard filters
│   └── upload.js         # Multer image storage settings
├── models/
│   ├── User.js           # User schema (Username, hashed password, bio, avatar)
│   ├── Post.js           # Post schema (Author, text, image, likes array)
│   └── Comment.js        # Comment schema (Post, Author, content, timestamps)
├── public/
│   ├── css/
│   │   └── style.css     # Premium UI styling tokens, variables, & responsive grid layouts
│   ├── js/
│   │   └── main.js       # Client interaction script (likes, comments, dragging, stories)
│   └── images/
│       └── default-avatar.svg # Glowing vector avatar placeholder
├── routes/
│   ├── authRoutes.js     # Auth endpoint handlers
│   ├── indexRoutes.js    # Root feed routing
│   ├── postRoutes.js     # Post interaction triggers
│   └── userRoutes.js     # User profile controls
└── views/
    ├── partials/
    │   ├── header.ejs    # Global header navigation and style imports
    │   ├── sidebar.ejs   # Left panel glass menus
    │   ├── right-sidebar.ejs # Right panel search & follow recommendations
    │   └── footer.ejs    # Floating panels, modal viewer overlays, and client scripts
    ├── feed.ejs          # Home timeline feed
    ├── profile.ejs       # Creator gallery grids & profile panels
    ├── create-post.ejs   # Mobile-responsive dedicated publisher
    ├── login.ejs         # Glass login gate
    ├── register.ejs      # Glass registration gate
    ├── 404.ejs           # Lost coordinate page
    └── 500.ejs           # Core server breakdown page
```

---

## 🛠️ Local Installation & Development

### Prerequisites
- **Node.js** (v16.0.0 or higher recommended)
- **MongoDB** (Local Community Server running, or a MongoDB Atlas cloud URI)

### Steps

1. **Clone or Navigate to the Workspace Directory**
   Ensure all files are placed in the directory: `c:\Mini connet code alpha`.

2. **Configure Environment Settings**
   The `.env` file is pre-configured for local development. To modify variables:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/miniconnect
   SESSION_SECRET=miniconnect_neon_super_secret_key_12345
   NODE_ENV=development
   ```

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
   *Alternative: Start standard production mode:*
   ```bash
   npm start
   ```

5. **Explore the Application**
   Open your browser and navigate to: `http://localhost:3000`.
   - The system will **automatically seed** several high-quality dummy posts and users on the first load!
   - You can log in using one of the pre-loaded creator accounts (password: `password123`):
     - `alex_cosmos` (Cosmic Explorer)
     - `elena_pixels` (Digital Painter)
     - `neon_coder` (Fullstack Coder)
     - `synth_clara` (Music Alchemist)
   - Or create a brand new account from the Register screen!

---

## 🚀 Deployment Instructions (Render + MongoDB Atlas)

MiniConnect is pre-configured and 100% deployment-ready for hosting platforms like **Render** and **Heroku**.

### Step 1: Set up MongoDB Atlas Cloud Cluster
1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Deploy a new Shared Cluster (M0 Free Tier).
3. Under **Network Access**, allow IP access (add `0.0.0.0/0` for cloud environments).
4. Under **Database Access**, create a user with read/write privileges.
5. Copy your **MongoDB Connection URI String**, which looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/miniconnect?retryWrites=true&w=majority`

### Step 2: Deploy on Render
1. Push the code to a private or public repository on **GitHub**.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Create a **New Web Service** and link it to your GitHub repository.
4. Set the following Build and Run configurations:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Advanced** to add the following **Environment Variables**:
   - `MONGODB_URI` = *Your MongoDB Atlas connection URI string copied in Step 1*
   - `SESSION_SECRET` = *A custom long random string (e.g. `c0sm1c_n30n_c0nn3ct_pr0_k3y`)*
   - `NODE_ENV` = `production`
6. Click **Deploy Web Service**! Render will build your dependencies, boot the server, connect securely to your MongoDB Atlas cloud database, auto-seed the premium content, and launch the site live!
