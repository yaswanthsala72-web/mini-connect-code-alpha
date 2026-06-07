const bcrypt = require('bcryptjs');

const mockUsers = [
  { _id: 'user_alex', username: 'alex_cosmos', password: '', bio: 'Cosmic Explorer 🌌 | UI UX Specialist', profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', followers: ['user_elena', 'user_neon'], following: ['user_elena'], createdAt: new Date(), comparePassword: async function(p) { return bcrypt.compare(p, this.password); } },
  { _id: 'user_elena', username: 'elena_pixels', password: '', bio: 'Digital Artist 🎨', profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', followers: ['user_alex'], following: ['user_alex', 'user_neon'], createdAt: new Date(), comparePassword: async function(p) { return bcrypt.compare(p, this.password); } },
  { _id: 'user_neon', username: 'neon_coder', password: '', bio: 'Fullstack Dev 💻', profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', followers: ['user_elena'], following: ['user_alex'], createdAt: new Date(), comparePassword: async function(p) { return bcrypt.compare(p, this.password); } },
  { _id: 'user_synth', username: 'synth_clara', password: '', bio: 'Music Alchemist 🎵', profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', followers: [], following: ['user_alex'], createdAt: new Date(), comparePassword: async function(p) { return bcrypt.compare(p, this.password); } },
  { _id: 'user_maya', username: 'maya_designs', password: '', bio: 'UI/UX Designer ✨', profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80', followers: ['user_neon'], following: [], createdAt: new Date(), isOnline: false, lastSeen: new Date(), comparePassword: async function(p) { return bcrypt.compare(p, this.password); } },
  { _id: 'user_jake', username: 'jake_devops', password: '', bio: 'DevOps Engineer ⚡', profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', followers: [], following: [], createdAt: new Date(), isOnline: false, lastSeen: new Date(), comparePassword: async function(p) { return bcrypt.compare(p, this.password); } },
  { _id: 'user_luna', username: 'luna_creates', password: '', bio: 'Content Creator 📸', profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', followers: ['user_elena'], following: [], createdAt: new Date(), isOnline: false, lastSeen: new Date(), comparePassword: async function(p) { return bcrypt.compare(p, this.password); } },
  { _id: 'user_kai', username: 'kai_motion', password: '', bio: 'Motion Designer 🎬', profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', followers: [], following: [], createdAt: new Date(), isOnline: false, lastSeen: new Date(), comparePassword: async function(p) { return bcrypt.compare(p, this.password); } },
  { _id: 'user_zara', username: 'zara_tech', password: '', bio: 'Tech Blogger 💡', profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', followers: [], following: [], createdAt: new Date(), isOnline: false, lastSeen: new Date(), comparePassword: async function(p) { return bcrypt.compare(p, this.password); } }
];

(async () => {
  const hash = await bcrypt.hash('password123', await bcrypt.genSalt(10));
  mockUsers.forEach(u => { u.password = hash; });
})();

const mockPosts = [
  { _id: 'post1', author: 'user_alex', content: 'Lost in the cosmic web of code! 🚀🌌 #glassmorphism #uiux', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80', likes: ['user_elena', 'user_neon'], views: 120, viewedBy: [], createdAt: new Date(Date.now() - 1800000) },
  { _id: 'post2', author: 'user_elena', content: 'Cyber neon workspace setup! 🎨 #deskinspiration #cyberpunk', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80', likes: ['user_alex', 'user_neon'], views: 85, viewedBy: [], createdAt: new Date(Date.now() - 7200000) },
  { _id: 'post3', author: 'user_neon', content: 'Refactoring MiniConnect backend! ☕️ #nodeJS #backend', image: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=800&auto=format&fit=crop&q=80', likes: ['user_alex'], views: 64, viewedBy: [], createdAt: new Date(Date.now() - 18000000) }
];

const mockComments = [
  { _id: 'comment1', post: 'post1', author: 'user_elena', content: 'Absolutely beautiful! 🌠', createdAt: new Date() },
  { _id: 'comment2', post: 'post1', author: 'user_neon', content: 'Spot on design! 🔥', createdAt: new Date() },
  { _id: 'comment3', post: 'post2', author: 'user_alex', content: 'Straight out of 2099! 🚀', createdAt: new Date() }
];

const mockBookmarks = [];
const mockNotifications = [];
const mockConversations = [];
const mockMessages = [];

const createQueryChain = (data) => ({
  populate: function() { return this; },
  sort: function(fn) {
    if (Array.isArray(data) && fn) data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return this;
  },
  select: function() { return this; },
  limit: function(n) { if (Array.isArray(data)) data = data.slice(0, n); return this; },
  then: function(resolve) { resolve(data); }
});

const applyUpdate = (obj, update) => {
  if (update.$set) Object.assign(obj, update.$set);
  if (update.$addToSet) Object.entries(update.$addToSet).forEach(([k, v]) => {
    if (!obj[k]) obj[k] = [];
    const s = v.toString();
    if (!obj[k].includes(s)) obj[k].push(s);
  });
  if (update.$pull) Object.entries(update.$pull).forEach(([k, v]) => {
    if (obj[k]) obj[k] = obj[k].filter(id => id.toString() !== v.toString());
  });
};

const populatePost = (p) => {
  const author = mockUsers.find(u => u._id === p.author);
  const comments = mockComments.filter(c => c.post === p._id).map(c => ({
    ...c, author: mockUsers.find(u => u._id === c.author) || { username: 'deleted', profilePicture: '/images/default-avatar.svg' }
  }));
  return { ...p, author: author || { _id: p.author, username: 'deleted', profilePicture: '/images/default-avatar.svg' }, comments };
};

const UserMock = {
  findOne: function(q) {
    let user;
    if (q.username) user = mockUsers.find(u => u.username === q.username.toLowerCase());
    else if (q._id) user = mockUsers.find(u => u._id === q._id.toString());
    return createQueryChain(user);
  },
  findById: function(id) { return createQueryChain(mockUsers.find(u => u._id === id.toString())); },
  create: async function(data) {
    const hash = await bcrypt.hash(data.password, await bcrypt.genSalt(10));
    const u = { _id: 'user_' + Date.now(), username: data.username.toLowerCase(), password: hash, bio: data.bio || 'Hey there!', profilePicture: data.profilePicture || '/images/default-avatar.svg', followers: [], following: [], createdAt: new Date(), comparePassword: async function(p) { return bcrypt.compare(p, this.password); } };
    mockUsers.push(u); return u;
  },
  findByIdAndUpdate: async function(id, update) {
    const user = mockUsers.find(u => u._id === id.toString());
    if (user) {
      applyUpdate(user, update);
      if (update.$set) Object.assign(user, update.$set);
    }
    return user;
  },
  find: function(q) {
    let m = [...mockUsers];
    if (q?.username?.$regex) { const r = new RegExp(q.username.$regex, 'i'); m = m.filter(u => r.test(u.username)); }
    if (q?.$or) { const r = new RegExp(q.$or[0]?.username?.$regex || q.$or[1]?.bio?.$regex || '', 'i'); m = m.filter(u => r.test(u.username) || r.test(u.bio)); }
    return createQueryChain(m);
  },
  countDocuments: async function() { return mockUsers.length; }
};

const PostMock = {
  find: function(q) {
    let posts = [...mockPosts];
    if (q?.author) posts = posts.filter(p => p.author === q.author.toString());
    if (q?._id?.$in) { const ids = q._id.$in.map(String); posts = posts.filter(p => ids.includes(p._id)); }
    if (q?.content?.$regex) { const r = new RegExp(q.content.$regex, q.content.$options || 'i'); posts = posts.filter(p => p.content && r.test(p.content)); }
    return createQueryChain(posts.map(populatePost));
  },
  findById: function(id) {
    const post = mockPosts.find(p => p._id === id.toString());
    if (post) { post.viewedBy = post.viewedBy || []; post.views = post.views || 0; post.save = async function() { return this; }; }
    return createQueryChain(post);
  },
  create: async function(data) {
    const p = { _id: 'post_' + Date.now(), author: data.author.toString(), content: data.content, image: data.image, likes: [], views: 0, viewedBy: [], createdAt: new Date() };
    mockPosts.push(p); return p;
  },
  deleteOne: async function(q) { const i = mockPosts.findIndex(p => p._id === q._id.toString()); if (i !== -1) mockPosts.splice(i, 1); return { deletedCount: 1 }; }
};

const CommentMock = {
  create: async function(data) {
    const c = { _id: 'comment_' + Date.now(), post: data.post.toString(), author: data.author.toString(), content: data.content, createdAt: new Date() };
    mockComments.push(c); return c;
  },
  find: function(q) { return createQueryChain(mockComments.filter(c => !q?.post || c.post === q.post.toString())); },
  findById: function(id) {
    const c = mockComments.find(x => x._id === id.toString());
    return createQueryChain({ ...c, author: mockUsers.find(u => u._id === c?.author) || { username: 'deleted', profilePicture: '/images/default-avatar.svg' } });
  },
  deleteMany: async function(q) { let d = 0; for (let i = mockComments.length - 1; i >= 0; i--) { if (mockComments[i].post === q.post.toString()) { mockComments.splice(i, 1); d++; } } return { deletedCount: d }; }
};

const BookmarkMock = {
  find: function(q) {
    let r = [...mockBookmarks];
    if (q?.user) r = r.filter(b => b.user === q.user.toString());
    const chain = createQueryChain(r);
    chain.sort = function() { r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); return createQueryChain(r); };
    return chain;
  },
  findOne: function(q) { return createQueryChain(mockBookmarks.find(b => b.user === q.user.toString() && b.post === q.post.toString())); },
  create: async function(data) { const b = { _id: 'bm_' + Date.now(), user: data.user.toString(), post: data.post.toString(), createdAt: new Date() }; mockBookmarks.push(b); return b; },
  deleteOne: async function(q) { const i = mockBookmarks.findIndex(b => b.user === q.user.toString() && b.post === q.post.toString()); if (i !== -1) mockBookmarks.splice(i, 1); return { deletedCount: 1 }; },
  deleteMany: async function(q) { let d = 0; for (let i = mockBookmarks.length - 1; i >= 0; i--) { if (mockBookmarks[i].post === q.post.toString()) { mockBookmarks.splice(i, 1); d++; } } return { deletedCount: d }; }
};

const enrichNotif = (n) => ({ ...n, sender: mockUsers.find(u => u._id === n.sender) || { username: 'unknown', profilePicture: '/images/default-avatar.svg' } });

const NotificationMock = {
  create: async function(data) {
    const n = { _id: 'notif_' + Date.now(), recipient: data.recipient.toString(), sender: data.sender.toString(), type: data.type, post: data.post?.toString(), message: data.message, read: false, createdAt: new Date(), save: async function() { return this; } };
    mockNotifications.unshift(n); return n;
  },
  find: function(q) {
    let r = mockNotifications.filter(n => n.recipient === q.recipient.toString());
    if (q.read === false) r = r.filter(n => !n.read);
    const chain = createQueryChain(r.map(enrichNotif));
    chain.sort = function() { r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); return createQueryChain(r.map(enrichNotif)); };
    chain.limit = function(n) { return createQueryChain(r.slice(0, n).map(enrichNotif)); };
    return chain;
  },
  findById: function(id) { const n = mockNotifications.find(x => x._id === id.toString()); if (n) n.save = async function() { return this; }; return createQueryChain(n); },
  countDocuments: async function(q) { return mockNotifications.filter(n => n.recipient === q.recipient.toString() && n.read === q.read).length; },
  updateMany: async function(q, update) { mockNotifications.forEach(n => { if (n.recipient === q.recipient.toString() && n.read === q.read && update.$set) Object.assign(n, update.$set); }); return { modifiedCount: 1 }; }
};

const ConversationMock = {
  find: function(q) {
    let r = [...mockConversations];
    if (q?.participants?.$all) { const ids = q.participants.$all.map(String); r = r.filter(c => ids.every(id => c.participants.includes(id))); }
    else if (q?.participants) { const pid = q.participants.toString(); r = r.filter(c => c.participants.map(String).includes(pid)); }
    const chain = createQueryChain(r);
    chain.sort = function() { r.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)); return createQueryChain(r); };
    return chain;
  },
  findById: function(id) { const c = mockConversations.find(x => x._id === id.toString()); if (c) c.save = async function() { return this; }; return createQueryChain(c); },
  findOne: function(q) {
    let c = null;
    if (q?.participants?.$all) { const ids = q.participants.$all.map(String); c = mockConversations.find(conv => ids.every(id => conv.participants.includes(id))); }
    if (c) c.save = async function() { return this; };
    return createQueryChain(c);
  },
  create: async function(data) {
    const c = { _id: 'conv_' + Date.now(), participants: data.participants.map(String), lastMessage: data.lastMessage, createdAt: new Date(), updatedAt: new Date(), save: async function() { return this; }, toObject: function() { return { ...this }; } };
    mockConversations.push(c); return c;
  }
};

const MessageMock = {
  find: function(q) {
    let r = [...mockMessages];
    if (q?.conversation) r = r.filter(m => m.conversation === q.conversation.toString());
    if (q?.receiver) r = r.filter(m => m.receiver === q.receiver.toString());
    if (q?.seen === false) r = r.filter(m => !m.seen);
    r = r.map(m => ({ ...m, sender: mockUsers.find(u => u._id === m.sender) || { _id: m.sender, username: 'deleted', profilePicture: '/images/default-avatar.svg' } }));
    const chain = createQueryChain(r);
    chain.sort = function() { r.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); return createQueryChain(r); };
    return chain;
  },
  create: async function(data) {
    const m = { _id: 'msg_' + Date.now(), conversation: data.conversation.toString(), sender: data.sender.toString(), receiver: data.receiver.toString(), text: data.text || '', image: data.image || '', delivered: data.delivered || false, seen: data.seen || false, createdAt: new Date() };
    mockMessages.push(m); return m;
  },
  updateMany: async function(q, update) {
    mockMessages.forEach(m => {
      let match = true;
      if (q.conversation && m.conversation !== q.conversation.toString()) match = false;
      if (q.receiver && m.receiver !== q.receiver.toString()) match = false;
      if (q.seen === false && m.seen !== false) match = false;
      if (match && update.$set) Object.assign(m, update.$set);
    });
    return { modifiedCount: 1 };
  }
};

const mockCaptionLogs = [];
const CaptionLogMock = {
  create: async function(data) {
    const entry = { _id: 'cap_' + Date.now(), ...data, user: data.user.toString(), createdAt: new Date() };
    mockCaptionLogs.push(entry); return entry;
  },
  find: function(q) {
    let r = mockCaptionLogs.filter(c => c.user === q.user.toString());
    return createQueryChain(r);
  }
};

const mockAnalytics = [];
const AnalyticsMock = {
  findOne: function(q) {
    let a = mockAnalytics.find(x => x.user === q.user.toString());
    if (!a) {
      a = { user: q.user.toString(), profileViews: 142, dailyFollowers: [], weeklyFollowers: [], monthlyFollowers: [], likesHistory: [], engagementHistory: [] };
      mockAnalytics.push(a);
    }
    return createQueryChain(a);
  },
  create: async function(data) {
    const a = { _id: 'an_' + Date.now(), ...data, user: data.user.toString(), profileViews: 0 };
    mockAnalytics.push(a); return a;
  }
};

module.exports = { UserMock, PostMock, CommentMock, BookmarkMock, NotificationMock, ConversationMock, MessageMock, CaptionLogMock, AnalyticsMock };
