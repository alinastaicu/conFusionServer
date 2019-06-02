var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var config = require('./config');

passport.use(new LocalStrategy(User.authenticate()));
var opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secretKey,
};
passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false);
      } else if (user) {
        console.log(Object.keys(user.toJSON()._id));
        return done(null, user.toJSON());
      } else {
        return done(null, false);
      }
    });
  }),
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

exports.verifyUser = passport.authenticate('jwt', { session: false });

exports.verifyAdmin = function(req, res, next) {
  if (!req.user.admin) {
    var err = new Error('You are not authorized to perform this operation!');
    err.status = 403;
    return next(err);
  } else {
    return next();
  }
};
