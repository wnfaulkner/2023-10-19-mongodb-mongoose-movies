const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/user');

passport.use(new GoogleStrategy(
  // Configuration object
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK
  },
  // The verify callback function...
  // Marking a function as an async function allows us
  // to consume promises using the await keyword
  async function(accessToken, refreshToken, profile, cb) {
    // When using async/await  we use a
    // try/catch block to handle an error
    try {
      // A user has logged in with OAuth...
      let user = await User.findOne({ googleId: profile.id });
      // Existing user found, so provide it to passport
      if (user) return cb(null, user);
      // We have a new user via OAuth!
      user = await User.create({
        name: profile.displayName,
        googleId: profile.id,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value
      });
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  }
));

//After the verify callback function returns the user document, passport calls the passport.serializeUser() method’s callback passing that same user document as an argument. It is the job of that callback function to return the nugget of data that passport is going to add to the session used to track the user.
passport.serializeUser(function(user, cb) {
  cb(null, user._id);
});

//The passport.deserializeUser() method’s callback function is called every time a request comes in from an existing logged in user. The callback needs to return what we want passport to assign to the req.user object.
passport.deserializeUser(async function(userId, cb) {
  // It's nice to be able to use await in-line!
  cb(null, await User.findById(userId));
});