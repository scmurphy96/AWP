const User = require('../db/User');
const router = require('express').Router();
const passport = require('passport');
module.exports = router;

router.put('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (!user) {
      res.status(401).send('User not found');
    } else if (!user.correctPassword(req.body.password)) {
      res.status(401).send('Incorrect password');
    } else {
      req.login(user, (err) => {
        if (err) {
          next(err);
        } else {
          res.send(user);
        }
      });
    }
  } catch (err) {
    next(err);
  }
});

router.post('/signup', async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    req.login(user, (err) => {
      if (err) {
        next(err);
      } else {
        res.send(user);
      }
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.sendStatus(204);
});

router.get('/me', async (req, res, next) => {
  res.send(req.user);
  // try {
  //   if (!req.user) {
  //     res.sendStatus(404);
  //   } else {
  //     const user = await User.findByPk(req.user.id);
  //     if (!user) {
  //       res.sendStatus(404);
  //     } else {
  //       res.send(user);
  //     }
  //   }
  // } catch (err) {
  //   next(err);
  // }
});

passport.serializeUser((user, done) => {
  try {
    done(null, user.id);
  } catch (err) {
    done(err);
  }
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
