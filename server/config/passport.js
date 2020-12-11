// cấu hình passport (middleware để đăng nhập)

const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const User = require("../models/User");

module.exports = (passport) => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_OR_KEY,
    // audience: 'yoursite.net',
  };

  passport.use(
    new JwtStrategy(opts, async (payload, done) => {
      try {
        const user = await User.findById(payload.id);
        if (user) return done(null, user);
        else return done(null, false);
      } catch (err) {
        console.log(err);
        return done(err, false);
      }
    })
  );

  passport.use;
};
