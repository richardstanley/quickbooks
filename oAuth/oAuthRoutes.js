var oAuthController = require('./oAuthController.js');
var passport = require('passport');
var QuickBooks = require('../node_modules/node-quickbooks/index.js');
var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://bizgramer.firebaseio.com/hr/BizData");

module.exports = function(app, express) {

  var QuickBooks = require('../node_modules/node-quickbooks/index.js')

  app.get('/', function(req, res){

    res.render('index', { user: req.user });
  });

  app.get('/login', function(req, res){
    res.render('login', { user: req.user });
  });

  app.get('/auth/intuit', passport.authenticate('intuit'),
    function(req, res) {

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

  });

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  app.get('/receivable', oAuthController.ensureAuthenticated, function(req) {
     var qbo = req.user.qbo;

     var myObjectArray = [];

     var qboFunc = new QuickBooks(qbo.consumerKey,
                            qbo.consumerSecret,
                            qbo.token,
                            qbo.tokenSecret,
                            qbo.realmId,
                            true, // use the Sandbox
                            true);

     qboFunc.reportAgedPayableDetail({num_periods:3}, function(_, report){

        for(var i = 0; i < report.Rows.Row.length - 1; i++){
          for(var j = 0; j < report.Rows.Row[i].Rows.Row.length; j++){
            var myObject = {};
            myObject["days_past_due"] = report.Rows.Row[i].Header.ColData[0].value;
            myObject["client"] = report.Rows.Row[i].Rows.Row[j].ColData[3].value;
            myObject["client_id"] = report.Rows.Row[i].Rows.Row[j].ColData[3].id;
            myObject["amount"] = report.Rows.Row[i].Rows.Row[j].ColData[5].value;
            myObject["open_balance"] = report.Rows.Row[i].Rows.Row[j].ColData[6].value;
            myObject["invoice_num"] = report.Rows.Row[i].Rows.Row[j].ColData[2].value;
            myObject["invoice_date"] = report.Rows.Row[i].Rows.Row[j].ColData[0].value;
            myObject["due_date"] = report.Rows.Row[i].Rows.Row[j].ColData[4].value;
            myObjectArray.push(myObject);
          }
        }

        myFirebaseRef.update(
          {
            Receivables: myObjectArray
          }
        );
     });
   });

  app.get('/payable', oAuthController.ensureAuthenticated, function(req) {
     var qbo = req.user.qbo;

     var myObjectArray = [];

     var qboFunc = new QuickBooks(qbo.consumerKey,
                            qbo.consumerSecret,
                            qbo.token,
                            qbo.tokenSecret,
                            qbo.realmId,
                            true, // use the Sandbox
                            true);

     qboFunc.reportAgedPayableDetail({num_periods:3}, function(_, report){

         for(var i = 0; i < report.Rows.Row.length - 1; i++){
          for(var j = 0; j < report.Rows.Row[i].Rows.Row.length; j++){
            var myObject = {};
            myObject["days_past_due"] = report.Rows.Row[i].Header.ColData[0].value;
            myObject["vendor"] = report.Rows.Row[i].Rows.Row[j].ColData[3].value;
            myObject["vendor_id"] = report.Rows.Row[i].Rows.Row[j].ColData[3].id;
            myObject["amount"] = report.Rows.Row[i].Rows.Row[j].ColData[6].value;
            myObject["open_balance"] = report.Rows.Row[i].Rows.Row[j].ColData[7].value;
            myObject["bill_num"] = report.Rows.Row[i].Rows.Row[j].ColData[2].value;
            myObject["billed_date"] = report.Rows.Row[i].Rows.Row[j].ColData[0].value;
            myObject["due_date"] = report.Rows.Row[i].Rows.Row[j].ColData[4].value;
            myObject["past_due"] = report.Rows.Row[i].Rows.Row[j].ColData[5].value;
            myObjectArray.push(myObject);
            console.log(myObject);
          }

         }

        myFirebaseRef.update(
          {
            Payables: myObjectArray
          }
        );
     });
   });

app.get('/customers', oAuthController.ensureAuthenticated, function(req) {
  var qbo = req.user.qbo;

  var myObjectArray = [];

  var qboFunc = new QuickBooks(qbo.consumerKey,
                         qbo.consumerSecret,
                         qbo.token,
                         qbo.tokenSecret,
                         qbo.realmId,
                         true, // use the Sandbox
                         true);

  qboFunc.findCustomers({}, function(err, data){
     if(err){console.log(err);}
     console.log(data);
     myObjectArray.push(data);

     myFirebaseRef.update(
       {
         Customers: myObjectArray
       }
     );
    });
  });
};

