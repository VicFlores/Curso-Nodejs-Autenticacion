const passport = require('passport');
const localStrategy = require('./strategies/local.strategies');
const jwtStrategy = require('./strategies/jwt.strategies');

passport.use(localStrategy);
passport.use(jwtStrategy);
