const router = require('express').Router();
const passport = require('passport');
module.exports = router;

router.get('/google', passport.authenticate('google', { scope: 'email' }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login',
  })
);

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    //Google will send back the token and profile
    async (token, refreshToken, profile, done) => {
      // the callback will pass back user profile information and each service (Facebook, Twitter, and Google) will pass it back a different way. Passport standardizes the information that comes back in its profile object.
      const info = {
        email: profile.emails[0].value,
        imageUrl: profile.photos ? profile.photos[0].value : undefined,
      };
      try {
        const [user] = await User.findOrCreate({
          where: {
            google_id: profile.id,
          },
          defaults: info,
        });
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);
