const User = require('../models/User');

// GET Register page
exports.getRegister = (req, res) => {
  res.render('register', { title: 'Register - MiniConnect', error: null });
};

// POST Register user
exports.postRegister = async (req, res) => {
  const { username, password, bio } = req.body;
  
  try {
    // Basic validation
    if (!username || !password) {
      return res.render('register', { title: 'Register - MiniConnect', error: 'Username and Password are required.' });
    }
    
    if (username.length < 3) {
      return res.render('register', { title: 'Register - MiniConnect', error: 'Username must be at least 3 characters.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUser) {
      return res.render('register', { title: 'Register - MiniConnect', error: 'Username is already taken.' });
    }

    // Create new user (password will be hashed in model pre-save hook)
    const newUser = await User.create({
      username: username.toLowerCase().trim(),
      password,
      bio: bio || 'Hey there! I am using MiniConnect.'
    });

    // Save user profile details to session (excluding password)
    req.session.user = {
      id: newUser._id,
      username: newUser.username,
      bio: newUser.bio,
      profilePicture: newUser.profilePicture
    };

    res.redirect('/');
  } catch (err) {
    console.error('Registration Error:', err);
    res.render('register', { title: 'Register - MiniConnect', error: 'An error occurred during registration. Please try again.' });
  }
};

// GET Login page
exports.getLogin = (req, res) => {
  res.render('login', { title: 'Login - MiniConnect', error: null });
};

// POST Login user
exports.postLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.render('login', { title: 'Login - MiniConnect', error: 'All fields are required.' });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.render('login', { title: 'Login - MiniConnect', error: 'Invalid username or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', { title: 'Login - MiniConnect', error: 'Invalid username or password.' });
    }

    // Save user info to session (excluding password)
    req.session.user = {
      id: user._id,
      username: user.username,
      bio: user.bio,
      profilePicture: user.profilePicture
    };

    res.redirect('/');
  } catch (err) {
    console.error('Login Error:', err);
    res.render('login', { title: 'Login - MiniConnect', error: 'An error occurred. Please try again.' });
  }
};

// GET Logout user
exports.getLogout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout Session Destroy Error:', err);
    }
    res.redirect('/auth/login');
  });
};
