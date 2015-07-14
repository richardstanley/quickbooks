var oAuthController = require('./oAuthController.js');
var passport = require('passport');
var QuickBooks = require('../node_modules/node-quickbooks/index.js');
var Q = require('q');
var Promise = require("bluebird");


module.exports = function(app, express) {

  var QuickBooks = require('../node_modules/node-quickbooks/index.js')

  app.get('/', function(req, res){
    console.log("index req.session ", req.session);
    console.log("index req.user ", req.user);
    console.log("index req.session.passport.user", req.session.passport.user)

    res.render('index', { user: req.user });
  });

  app.get('/login', function(req, res){
    console.log("login req.session ", req.session);
    console.log("login req.user ", req.user);
    console.log("login req.session.passport.user", req.session.passport.user)
    res.render('login', { user: req.user });
  });

  app.get('/auth/intuit', passport.authenticate('intuit'),
    function(req, res) {

  } );

  app.get('/auth/intuit/callback',
    passport.authenticate('intuit', { failureRedirect: '/login' }),
     function(req, res) {
        console.log("Successful LOGIN YAY!");
        res.redirect('/');
    }
  );


  app.get('/account', oAuthController.ensureAuthenticated, function(req, res){
    var qbo = req.user.qbo;
    console.log("account req.session ", req.session);
    console.log("account req.user ", req.user);
    console.log("account req.session.passport.user", req.session.passport.user);

    var qboFunc = new QuickBooks(qbo.consumerKey,
                           qbo.consumerSecret,
                           qbo.token,
                           qbo.tokenSecret,
                           qbo.realmId,
                           true, // use the Sandbox
                           true)
    var myAccounts = [];

    qboFunc.findAccounts(function(_, accounts) {

        accounts.QueryResponse.Account.forEach(function(account) {
          myAccounts.push(account.Name);
        })
        console.log("-------");
        console.log("what is myAccount", myAccounts);
        console.log("-------");
        res.render('account', { user: req.user, myAccounts: myAccounts });

      });


  });
  var yeardates = ["2015-01-01", "2015-02-01","2015-03-01",
  "2015-04-01","2015-05-01","2015-06-01","2015-07-01","2015-08-01", "2015-09-01",
  "2015-10-01", "2015-11-01", "2015-12-01"];

  app.get('/profit', oAuthController.ensureAuthenticated,  function(req, res) {
    var qbo = req.user.qbo;

    console.log("profit req.session ", req.session);
    console.log("profit req.user ", req.user);
    console.log("profit req.session.passport.user", req.session.passport.user);
    // var dates = {
    //   start_date: '2015-04-01',
    //   end_date: '2015-05-01'
    // }
    var myObjectArray = [];

    var myReport;
    var qboFunc = new QuickBooks(qbo.consumerKey,
                           qbo.consumerSecret,
                           qbo.token,
                           qbo.tokenSecret,
                           qbo.realmId,
                           true, // use the Sandbox
                           true)

    var getmyMonth = function(dates) {
      qboFunc.reportProfitAndLoss(dates,

      function(_, report) {
         myReport = report;
         var myObject = {};
         for(var i = 0; i < myReport.Rows.Row.length; i++){
            if(myReport.Rows.Row[i].Summary.ColData[1] !== undefined ){

              myObject[myReport.Rows.Row[i].Summary.ColData[0].value] = myReport.Rows.Row[i].Summary.ColData[1].value;
              console.log( myObject[myReport.Rows.Row[i].Summary.ColData[0].value], myReport.Rows.Row[i].Summary.ColData[1].value)
            } else {

              myObject[myReport.Rows.Row[i].Summary.ColData[0].value] = '0.00';
              console.log( myObject[myReport.Rows.Row[i].Summary.ColData[0].value], '0.00')
            }
          }
          myObjectArray.push(myObject);

          if(myObjectArray.length === 11) {
              console.log(myObjectArray);
              res.render('profit.ejs', {myObjectArray: myObjectArray })
          }


        }
      )
    }
    for(var i = 0; i < yeardates.length-1; i++){
      var dates = {};
      dates.start_date =  yeardates[i];
      dates.end_date =  yeardates[i+1];
      console.log("request "+i+" start: "+dates.start_date+" end: "+dates.end_date);
      getmyMonth(dates)
    }


    //build one date object with key value pairs.
    // qboFunc.reportProfitAndLoss(dates,

    //   function(_, report) {
    //     myReport = report;

    //     for(var i = 0; i < myReport.Rows.Row.length; i++){
    //         myObject[myReport.Rows.Row[i].Summary.ColData[0].value] = myReport.Rows.Row[i].Summary.ColData[1].value;
    //         console.log( myObject[myReport.Rows.Row[i].Summary.ColData[0].value], myReport.Rows.Row[i].Summary.ColData[1].value)
    //     }
    //     res.render('profit.ejs', {myObject: myObject })

    //   }
    // );

  });

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });




  // for(var i = 0; i < response.Rows.Row.length; i++){
  //             obj[response.Rows.Row[i].Summary.ColData[0].value] = response.Rows.Row[i].Summary.ColData[1].value;
  //         }


}
