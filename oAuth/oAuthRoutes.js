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
    var qbo = req.user.qbo;
    // console.log("qbo", qbo);
    // console.log("typeof qbo in routes", typeof qbo)
    // console.log("ROUTES VARIABLES!!!")
    // console.log("INTUIT_CONSUMER_KEY", qbo.consumerKey, typeof qbo.consumerKey);
    // console.log("INTUIT_CONSUMER_KEY", qbo.consumerSecret, typeof qbo.consumerSecret);
    // console.log("token", qbo.token, typeof qbo.token);
    // console.log("tokenSecret", qbo.tokenSecret, typeof qbo.tokenSecret);
    // console.log("profile.realmId", qbo.realmId, typeof qbo.realmId);
    // console.log("END ROUTES VARIABLES!!!")

    var qboFunc = new QuickBooks(qbo.consumerKey,
                           qbo.consumerSecret,
                           qbo.token,
                           qbo.tokenSecret,
                           qbo.realmId,
                           true, // use the Sandbox
                           true)
    var myAccounts = [];
    // console.log("QBO func constructor", qboFunc.constructor)
     qboFunc.findAccounts(function(_, accounts) {

        accounts.QueryResponse.Account.forEach(function(account) {

          myAccounts.push(account.Name);

        });
      });
     console.log("-------");
     console.log("what is myAcount", myAccounts);
     console.log("-------");
    res.render('account', { user: req.user, myAccounts: myAccounts });

  });

  app.get('/profit', oAuthController.ensureAuthenticated,  function(req, res) {
    var qbo = req.user.qbo;

    var dates = {
      start_date: '2015-04-01',
      end_date: '2015-05-01'
    }
    var myObject = {};
    var myReport;
    var qboFunc = new QuickBooks(qbo.consumerKey,
                           qbo.consumerSecret,
                           qbo.token,
                           qbo.tokenSecret,
                           qbo.realmId,
                           true, // use the Sandbox
                           true)

    //build one date object with key value pairs.
    qboFunc.reportProfitAndLoss(dates,
      function(_, report) {
        console.log(report);
        myReport = report
      }
    );
    console.log("heresmyReport!!!", myReport)
    //process report
    for(var i = 0; i < myReport.Rows.Row.length; i++){
        myObject[myReport.Rows.Row[i].Summary.ColData[0].value] = myReport.Rows.Row[i].Summary.ColData[1].value;
    }

    res.render('profit.ejs', {myObject: myObject })
  });

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });




  // for(var i = 0; i < response.Rows.Row.length; i++){
  //             obj[response.Rows.Row[i].Summary.ColData[0].value] = response.Rows.Row[i].Summary.ColData[1].value;
  //         }


}
