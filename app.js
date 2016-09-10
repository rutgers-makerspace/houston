
////////////////////////////////////////////////////////////////////////////////
// IMPORTS /////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// CORE ////////////////////////////////////////////////////////////////////////

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var app = express();
var server = require('http').Server(app);

// WEBPACK /////////////////////////////////////////////////////////////////////

var webpack = require('webpack');
var webpackMiddleware = require("webpack-dev-middleware");
var config = require('./config/webpack.dev.config');

// PASSPORT ////////////////////////////////////////////////////////////////////

var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local');

// MONGO ///////////////////////////////////////////////////////////////////////

var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
mongoose.connect(process.env.MONGODB_URI);

////////////////////////////////////////////////////////////////////////////////
// CORE ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

////////////////////////////////////////////////////////////////////////////////
// WEBPACK /////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var compiler = webpack(config);
if (process.env.DEV) {
  app.use(webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true
  }));
  app.use(require('webpack-hot-middleware')(compiler));
}

////////////////////////////////////////////////////////////////////////////////
// PASSPORT ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var localStrat = require('./config/local.passport.js');
var githubStrat = require('./config/github.passport.js');

app.use(session({
  secret: process.env.SECRET,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));

passport.use(localStrat);
passport.use(githubStrat);

app.use(passport.initialize());
app.use(passport.session());

////////////////////////////////////////////////////////////////////////////////
// ROUTES //////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// API /////////////////////////////////////////////////////////////////////////


// VIEWS ///////////////////////////////////////////////////////////////////////
var routes = require('./routes/index');

app.use('/', routes);

// ERRORS //////////////////////////////////////////////////////////////////////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

////////////////////////////////////////////////////////////////////////////////
// SOCKETS /////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// TODO

////////////////////////////////////////////////////////////////////////////////
// EXPORTS /////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

module.exports = {
  app,
  server
};
