var morgan      = require('morgan');
var session = require('express-session');
var methodOverride = require('method-override');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser  = require('body-parser');

module.exports = function(app, express) {

  var authRouter = express.Router();
  // var profitRouter = express.Router();

  app.use(morgan('dev'));
  app.use(methodOverride('X-HTTP-Method-Override'));
  app.use(session({secret: 'kari',
                 saveUninitialized: true,
                 resave: true,
                cookie: { maxAge: null }}));
  app.use(cookieParser());
  app.use(bodyParser.json())
  app.use(passport.initialize());
  app.use(passport.session());
  // app.use(bodyParser());
  // app.use(bodyParser.urlencoded({extended: true}));
  // app.use(bodyParser.json());


  // app.use(express.bodyParser());
  // app.use(express.cookieParser('kari'));

  // app.use('/profit', profitRouter);
  app.use(authRouter);

  require('../oAuth/oAuthRoutes.js')(authRouter);
  // require('../routes/profit.js')(profitRouter);

}
