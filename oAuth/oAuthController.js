var passport = require('passport')
  , util = require('util')
  , IntuitStrategy = require('passport-intuit-oauth').Strategy;

var INTUIT_CONSUMER_KEY = 'qyprdns8EP57q1ffSi1EqWyK4q47qm'
var INTUIT_CONSUMER_SECRET = 'izBgcIONbmMOsePPh18AA8glJ04Or0HMkMDK2a4a';
var QuickBooks = require('../node_modules/node-quickbooks/index.js');

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Intuit profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the IntuitStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Intuit profile), and
//   invoke a callback with a user object.
passport.use(new IntuitStrategy({
    consumerKey: INTUIT_CONSUMER_KEY,
    consumerSecret: INTUIT_CONSUMER_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/intuit/callback"
  },
  function(token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      console.log("profile in Controller", profile);

      var qbo = new QuickBooks(INTUIT_CONSUMER_KEY,
                           INTUIT_CONSUMER_SECRET,
                           token,
                           tokenSecret,
                           profile.realmId,
                           true, // use the Sandbox
                           true);
                           // turn debugging on
      // console.log("CONTROLLER VARIABLES!!!")
      // console.log("INTUIT_CONSUMER_KEY", INTUIT_CONSUMER_KEY, typeof INTUIT_CONSUMER_KEY);
      // console.log("INTUIT_CONSUMER_KEY", INTUIT_CONSUMER_SECRET, typeof INTUIT_CONSUMER_SECRET);
      // console.log("token", token, typeof token);
      // console.log("tokenSecret", tokenSecret, typeof tokenSecret);
      // console.log("profile.realmId", profile.realmId, typeof profile.realmId);
      // console.log("END CONTROLLER VARIABLES!!!")

      // console.log("constructor", qbo.constructor);
      // qbo.findAccounts(function(_, accounts) {
      //   accounts.QueryResponse.Account.forEach(function(account) {
      //     console.log(account.Name)
      //   })
      // })
      profile.qbo = qbo;

      // To keep the example simple, the user's Intuit profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Intuit account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

// qbo = new QuickBooks(consumerKey,
  //                          consumerSecret,
  //                          accessToken.oauth_token, //req.session.oauth_token
  //                          accessToken.oauth_token_secret, //req.session.oauth_token_secret
  //                          postBody.oauth.realmId,
  //                          true, // use the Sandbox
  //                          true); // turn debugging on

module.exports = {
  ensureAuthenticated: function(req, res, next) {
    // console.log("request", req)
    // console.log("HEEELLLOO", req.user);

    // req.qbo =
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
  }
}
