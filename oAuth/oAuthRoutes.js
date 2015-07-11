var oAuthController = require('./oAuthController.js');
var passport = require('passport');
var QuickBooks = require('../node_modules/node-quickbooks/index.js');

module.exports = function(app, express) {


  var request = require('request');
  // var qs = require('querystring');
  var QuickBooks = require('../node_modules/node-quickbooks/index.js')


  // var APP_CENTER_BASE = 'https://appcenter.intuit.com';
  // var REQUEST_TOKEN_URL = 'https://oauth.intuit.com/oauth/v1/get_request_token'
  // var APP_CENTER_URL = APP_CENTER_BASE + '/Connect/Begin?oauth_token='
  // var ACCESS_TOKEN_URL = 'https://oauth.intuit.com/oauth/v1/get_access_token'

  app.get('/', function(req, res){

    res.render('index', { user: req.user });
  });

  app.get('/login', function(req, res){
    res.render('login', { user: req.user });
  });

  app.get('/auth/intuit', passport.authenticate('intuit'),
    function(req, res) {

    // res.render('intuit.ejs', {locals: {port:port, appCenter: APP_CENTER_BASE }} )
  } );

  app.get('/auth/intuit/callback',
    passport.authenticate('intuit', { failureRedirect: '/login' }),
     function(req, res) {
        console.log("Successful LOGIN YAY!");
        console.log(req.user);
        res.redirect('/');
    }
  );

  app.get('/account', oAuthController.ensureAuthenticated, function(req, res){
    console.log("req.user.qbo", req.user.qbo);
     var qbo = req.user.qbo;

    var qboFunc = new QuickBooks(qbo.consumer_key,
                           qbo.consumerSecret,
                           qbo.token,
                           qbo.tokenSecret,
                           qbo.realmId,
                           true, // use the Sandbox
                           true)

  console.log("QBO IN controller", qbo)
     qboFunc.findAccounts(function(_, accounts) {
        accounts.QueryResponse.Account.forEach(function(account) {
          console.log(account.Name)
        })
      })
    res.render('account', { user: req.user });
  });

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
  // app.get('/requestToken', function(req, res) {
  // var postBody = {
  //   url: 'https://oauth.intuit.com/oauth/v1/get_request_token',
  //   oauth: {
  //     callback:        'http://localhost:' + port + '/callback/',
  //     consumer_key:    consumerKey,
  //     consumer_secret: consumerSecret
  //   }
  // }
  // request.post(postBody, function (e, r, data) {
  //   var requestToken = qs.parse(data);
  //   req.session.oauth_token = requestToken.oauth_token;
  //   req.session.oauth_token_secret = requestToken.oauth_token_secret;

  //   console.log(requestToken)
  //   res.redirect(APP_CENTER_URL + requestToken.oauth_token)
  //   })
  // });

  // app.get('/callback', function(req, res) {
  //   var postBody = {
  //     url: ACCESS_TOKEN_URL,
  //     oauth: {
  //       consumer_key:    consumerKey,
  //       consumer_secret: consumerSecret,
  //       token:           req.query.oauth_token,
  //       token_secret:    req.session.oauth_token_secret,
  //       verifier:        req.query.oauth_verifier,
  //       realmId:         req.query.realmId
  //     }
  //   }

  //   req.session.realmId = postBody.oauth.realmId;

  //   request.post(postBody, function (e, r, data) {
  //     var accessToken = qs.parse(data)
  //     console.log(accessToken)
  //     console.log(postBody.oauth.realmId)

  //     // save the access token somewhere on behalf of the logged in user
  //     qbo = new QuickBooks(consumerKey,
  //                          consumerSecret,
  //                          accessToken.oauth_token, //req.session.oauth_token
  //                          accessToken.oauth_token_secret, //req.session.oauth_token_secret
  //                          postBody.oauth.realmId,
  //                          true, // use the Sandbox
  //                          true); // turn debugging on
  //     //req.session.qbo = qbo;

  //     // test out account access
  //     // qbo.findAccounts(function(_, accounts) {
  //     //     console.log(account.Name)
  //     //   })
  //     });

  //     res.send('<!DOCTYPE html><html lang="en"><head></head><body><script>window.opener.location.reload(); window.close();</script></body></html>');
  //   });


  var dates = {
    start_date: '2015-04-01',
    end_date: '2015-05-01'
  }
  var myObject = {};

  app.get('/profit', function(req, res) {
    var qbo = new QuickBooks(consumerKey, consumerSecret, req.session.oauth_token, req.session.oauth_token_secret, req.session.realmId, true, true)
    console.log(qbo);

    qbo.reportProfitAndLoss(dates, function(_, report) {
      console.log(report);
      myObject = report


    })

    res.render('profit.ejs', {locals: {object: myObject }} )
  });

  // for(var i = 0; i < response.Rows.Row.length; i++){
  //             obj[response.Rows.Row[i].Summary.ColData[0].value] = response.Rows.Row[i].Summary.ColData[1].value;
  //         }


}
