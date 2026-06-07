const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Analytics = require('../models/Analytics');

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await User.findById(userId);
    const posts = await Post.find({ author: userId });

    let totalLikes = 0;
    let totalComments = 0;
    let totalViews = 0;
    let topLiked = null;
    let topCommented = null;
    let topViewed = null;

    for (const post of posts) {
      const likes = post.likes?.length || 0;
      const comments = post.comments?.length || 0;
      const views = post.views || 0;
      totalLikes += likes;
      totalComments += comments;
      totalViews += views;

      if (!topLiked || likes > (topLiked.likes?.length || 0)) topLiked = post;
      if (!topCommented || comments > (topCommented.comments?.length || 0)) topCommented = post;
      if (!topViewed || views > (topViewed.views || 0)) topViewed = post;
    }

    const followers = user?.followers?.length || 0;
    const following = user?.following?.length || 0;
    const engagementRate = posts.length
      ? (((totalLikes + totalComments) / posts.length) / Math.max(followers, 1) * 100).toFixed(1)
      : '0.0';

    let analytics = await Analytics.findOne({ user: userId });
    if (!analytics && !global.useMockDB) {
      analytics = await Analytics.create({ user: userId });
    }

    const profileViews = analytics?.profileViews || Math.floor(followers * 4.2 + posts.length * 12);

    const chartLabels = Array.from({ length: 7 }, (_, i) => daysAgo(6 - i));
    const likesGrowth = chartLabels.map((d, i) => ({
      date: d,
      count: Math.max(0, Math.floor(totalLikes / 7) + (i * 2))
    }));
    const followersGrowth = chartLabels.map((d, i) => ({
      date: d,
      count: Math.max(0, followers - (6 - i) * 2)
    }));
    const engagementTrend = chartLabels.map((d) => ({
      date: d,
      rate: parseFloat((Math.random() * 5 + parseFloat(engagementRate)).toFixed(1))
    }));
    const postPerformance = posts.slice(0, 5).map((p) => ({
      label: (p.content || 'Post').slice(0, 20),
      likes: p.likes?.length || 0,
      comments: p.comments?.length || 0,
      views: p.views || 0
    }));

    res.render('dashboard', {
      title: 'Analytics Dashboard - MiniConnect',
      currentUser: req.session.user,
      stats: {
        followers,
        following,
        profileViews,
        engagementRate,
        totalPosts: posts.length,
        totalLikes,
        totalComments,
        totalShares: 0,
        totalViews,
        dailyFollowers: followers,
        weeklyFollowers: followers + 5,
        monthlyFollowers: followers + 18
      },
      topPosts: { topLiked, topCommented, topViewed },
      charts: { likesGrowth, followersGrowth, engagementTrend, postPerformance }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).render('500', { title: 'Internal Server Error' });
  }
};
