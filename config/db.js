const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

global.useMockDB = true; // Initialize Sandbox DB to true by default to handle instant startup race conditions

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/miniconnect', {
      serverSelectionTimeoutMS: 2000 // Timeout fast so fallback triggers in 2 seconds
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useMockDB = false;
    
    // Trigger Auto-seeding
    await seedDatabase();
  } catch (err) {
    console.log('\n=============================================================');
    console.log('⚠️  [ALERT] LOCAL MONGODB SERVICE OFFLINE (NOT FOUND)');
    console.log('🚀  [SANDBOX ACTIVE] SWITCHING TO HIGH-FIDELITY IN-MEMORY MOCK DATABASE!');
    console.log('👉  This lets you test the complete app, likes, and comments instantly!');
    console.log('=============================================================\n');
    global.useMockDB = true;
  }
};

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data. Skipping auto-seeding.');
      return;
    }

    console.log('Database is empty. Initiating premium auto-seeding...');

    // 1. Create premium mock users
    const seedUsers = [
      {
        username: 'alex_cosmos',
        password: 'password123', // Will be hashed by pre-save hook
        bio: 'Cosmic Explorer 🌌 | UI UX Specialist | Chasing stars and neon glassbars.',
        profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      {
        username: 'elena_pixels',
        password: 'password123',
        bio: 'Digital Artist 🎨 | Pixels Enthusiast | Rendering dark modes with vibrant neon accents.',
        profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      },
      {
        username: 'neon_coder',
        password: 'password123',
        bio: 'Fullstack Dev 💻 | Night coder | Turning espresso shots into premium interactive code.',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      {
        username: 'synth_clara',
        password: 'password123',
        bio: 'Music Alchemist 🎵 | Synthesizing retro vaporwave tracks under pink neon lights.',
        profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
      }
    ];

    const users = await User.create(seedUsers);
    console.log(`Seeded ${users.length} users successfully.`);

    // 2. Create premium mock posts
    const seedPosts = [
      {
        author: users[0]._id, // alex_cosmos
        content: 'Lost in the cosmic web of code. The way glassmorphic elements overlap under neon glow is absolute magic! Who is building something beautiful today? 🚀🌌 #glassmorphism #uiux',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        likes: [users[1]._id, users[2]._id]
      },
      {
        author: users[1]._id, // elena_pixels
        content: 'Just finished my new cyber neon workspace setup. A dark theme with glass shelves and hot pink accent lights. Focus has never been higher! 🎨✨ #deskinspiration #setup #cyberpunk',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
        likes: [users[0]._id, users[2]._id, users[3]._id]
      },
      {
        author: users[2]._id, // neon_coder
        content: 'Refactoring the MiniConnect Express backend routes to use standard MVC boundaries. Clean folders, robust controllers, secure session cookies, and zero leaks. Beautiful! ☕️💻 #nodeJS #backend #javascript',
        image: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=800&auto=format&fit=crop&q=80',
        likes: [users[0]._id, users[3]._id]
      },
      {
        author: users[3]._id, // synth_clara
        content: 'Midnight jam session. Custom analog synths, retro visualizers, and heavy bass lines. Preparing a brand-new release for you all! 🎹🎧 #synthwave #musicstudio #vibe',
        image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
        likes: [users[1]._id]
      }
    ];

    const posts = await Post.create(seedPosts);
    console.log(`Seeded ${posts.length} posts successfully.`);

    // 3. Create high-fidelity mock comments
    const seedComments = [
      {
        post: posts[0]._id,
        author: users[1]._id,
        content: 'Absolutely beautiful! Love the neon starry vibe! 🌠'
      },
      {
        post: posts[0]._id,
        author: users[2]._id,
        content: 'The backdrop blur settings on this design are spot on, Alex. 🔥'
      },
      {
        post: posts[1]._id,
        author: users[0]._id,
        content: 'This setup is straight out of the year 2099! 🚀 Space design!'
      },
      {
        post: posts[1]._id,
        author: users[3]._id,
        content: 'Perfect for producing synth tracks too! Loving those neon tubes. 🎹'
      },
      {
        post: posts[2]._id,
        author: users[0]._id,
        content: 'Clean code is the ultimate form of art, coder. Respect!'
      },
      {
        post: posts[3]._id,
        author: users[1]._id,
        content: 'Can’t wait to paint while listening to this new track Clara! 🎨🎶'
      }
    ];

    const comments = await Comment.create(seedComments);
    console.log(`Seeded ${comments.length} comments successfully.`);
    console.log('Premium Database auto-seeding completed flawlessly.');
  } catch (err) {
    console.error(`Auto-seeding Error: ${err.message}`);
  }
};

module.exports = connectDB;
