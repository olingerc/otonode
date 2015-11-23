var express        = require('express'),
    http         = require('http'),
    passport     = require('passport'),
    path         = require('path'),
    User_Ctrl    = require('./server/core/controllers/user.js'),
    _            = require('underscore'),
    mongoose     = require('mongoose'),
    httpProxy    = require('http-proxy'),
    formidable   = require('formidable'),
    mv           = require('mv'),
    cookieParser = require('cookie-parser'),
    session      = require('express-session'),
    csrf         = require('csurf'),
    morgan       = require('morgan'),
    compression = require('compression'),
    bodyParser   = require('body-parser');

var MongoStore   = require('connect-mongo')(session);

/**
 * Define environment. Should be pre-set via grunt already or in commandline!
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

//Initialize system variables (uses NODE_ENV to set settings)
var config = require('./config/config');

// Configure mongoose connection
mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

/**
 * Configure app
 */

var app = module.exports = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/client/js/core');

app.locals.pretty = true;
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/uploads', express.static('/home/christophe/otouploads'));

app.use(express.static(path.join(__dirname, 'client')));

/**
 * AUTHENTICATION
 */

// Load passposrt config
require('./config/passport')(passport);
//make sure at least one admin user exists
User_Ctrl.checkAdminMinimum();
app.use(session({
    secret: config.sessionSecret,
    cookie: { maxAge: 3600000 },
    resave: true,
    store: new MongoStore({ mongooseConnection: mongoose.connections[0] }),
    saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser()); // read cookies (needed for auth)
app.use(csrf());
app.use(function(req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    res.locals.csrftoken = req.csrfToken();
    next();
});


/**
 * FORMIDABLE
 */
 //keep after session initialization!
app.use(function(req, res, next) {
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {

    var form = new formidable.IncomingForm();
    var fieldsObj = {};
    var filesObj = {};

    form.uploadDir = "/home/christophe/otouploads";

    form.on('field', function(field, value) {
      fieldsObj[field] = value;
    });

    form.on('file', function(field, file) {
      filesObj[field] = file;
    });

    form.on('end', function() {
      req.body = fieldsObj;
      req.files = filesObj;

      next();
    });

    form.parse(req);

  }
  else {
    next();
  }

});

/**
 * DEFINE ROUTES
 */

// Core route: authentication api
var routes = require('./server/core/routes/authRoutes');

// Add module API ROUTES (plugin entry point, just add routes to this array)
routes = routes.concat(require('./server/household/routes'));
routes = routes.concat(require('./server/watchlist/routes'));
routes = routes.concat(require('./server/notes/routes'));

//Remaining routes are handled by angular
routes = routes.concat(require('./server/core/routes/angularRoutes'));
//Clean up routes
routes = _.uniq(routes);

/**
 * Setup routes
 */
require('./server/core/setupRouting.js')(app, routes);
/**
 * Configure Server
 */
app.set('port', process.env.PORT || config.port);
var server = http.createServer(app);

/**
 * Start Server
 */
server.listen(app.get('port'), function(){
     console.log('Express server listening on port ' + app.get('port'));
});
