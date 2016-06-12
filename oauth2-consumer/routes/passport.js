var express = require('express');
var router = express.Router();

var passport = require('passport'),
    User = require('../user'),
    ExampleStrategy = require('../passport-example/strategy').Strategy,
    oauthConfig = require('../oauth-config'),
    pConf = oauthConfig.provider,
    lConf = oauthConfig.consumer,
    opts = require('../oauth-consumer-config');

//passport配置
passport.serializeUser(function(user, done) {
  //Users.create(user);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  var user = obj // Users.read(obj)
    ;

  done(null, user);
});

passport.use(new ExampleStrategy({
    // see https://github.com/jaredhanson/oauth2orize/blob/master/examples/all-grants/db/clients.js
    clientID: opts.clientId
  , clientSecret: opts.clientSecret
  , callbackURL: lConf.protocol + "://" + lConf.host + "/auth/example-oauth2orize/callback"
  }
, function (accessToken, refreshToken, profile, done) {
    User.findOrCreate({ profile: profile }, function (err, user) {
      user.accessToken = accessToken;
      return done(err, user);
    });
  }
));

router.get('/externalapi/account', function (req, res, next) {
  console.log('[using accessToken]', req.user.accessToken);
  if (false) { next(); }
  var request = require('request')
    , options = {
        // url: pConf.protocol + '://' + pConf.host + '/api/exampleauth/me'
        url: pConf.protocol + '://' + pConf.host + '/api/userinfo'
      , headers: {
          'Authorization': 'Bearer ' + req.user.accessToken
        }
      }
    ;

  function callback(error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log(body);
      res.end(body);
    } else {
      res.end('error: \n' + body);
    }
  }

  request(options, callback);
});
/*
*/
router.get('/auth/example-oauth2orize', passport.authenticate('exampleauth', { scope: ['email'] }));
router.get('/auth/example-oauth2orize/callback'
  //passport.authenticate('facebook', { successRedirect: '/close.html?accessToken=blar',
  //                                    failureRedirect: '/close.html?error=foo' }));
, passport.authenticate('exampleauth', { failureRedirect: '/close.html?error=foo' })
);
router.get('/auth/example-oauth2orize/callback'
, function (req, res) {
    console.log('req.session');
    console.log(req.session);
    var url = '/success.html' // + '?type=fb'
      /*
      + '&accessToken=' + req.session.passport.user.accessToken
      + '&email=' + req.session.passport.user.profile.email
      + '&link=' + req.session.passport.user.profile.profileUrl
      */
      ;

    console.log(url);
    res.statusCode = 302;
    res.setHeader('Location', url);
    res.end('hello');
    // This will pass through to the static module
    //req.url = url;
    //next();
  }
);
router.post('/auth/example-oauth2orize/callback', function (req, res/*, next*/) {
  console.log('req.user', req.user);
  res.end('thanks for playing');
});

module.exports = router;