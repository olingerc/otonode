var express =       require('express')
    , mongoStore = require('connect-mongo')(express)
    , http =        require('http')
    , passport =    require('passport')
    , path =        require('path')
    , User =        require('./server/core/models/User.js');

/**
 * Define environment. Can be pre-set via grunt already
 */

process.env.NODE_ENV = process.env.NODE_ENV || 'development';


//Initialize system variables
var config = require('./config/config'),
    mongoose = require('mongoose');

// Bootstrap db connection
var db = mongoose.connect(config.db);

/**
 * Configure app
 */

var app = module.exports = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/client/js/core');


//Not sure from mean
   app.set('showStackError', true); //Necessary?
   //Mean uses dynamic helpers. what are those?
//End not sure

//Taken over from MEAN
   app.locals.pretty = true;
    // Should be placed before express.static
    // To ensure that all assets and data are compressed (utilize bandwidth)
   app.use(express.compress({
      filter: function(req, res) {
         return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
      },
      // Levels are specified in a range of 0 to 9, where-as 0 is
      // no compression and 9 is best compression, but slowest
      level: 9
   }));

   // Only use logger for development environment
   if (process.env.NODE_ENV === 'development') {
      app.use(express.logger('dev'));
   }

   app.enable('jsonp callback');
//END taken over

app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.static(path.join(__dirname, 'client')));
app.use(express.cookieParser());
app.use(express.cookieSession(
    {
        secret: config.sessionSecret,
        store: new mongoStore({
            db: db.connection.db,
            collection: config.sessionCollection
        })
    }));

app.configure('development', 'production', function() {
    app.use(express.csrf());
    app.use(function(req, res, next) {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        next();
    });
});

/**
 * AUTHENTICATION
 */

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.localStrategy);
passport.use(User.googleStrategy());   // Comment out this line if you don't want to enable login via Google

passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);

/**
 * API MODULES (Need to be defined before core routes)
 */
var household = require('./server/household/api');
app.use(household);

/**
 * CORE ROUTES
 */
require('./server/core/routes.js')(app);

/**
 * Start Server
 */
app.set('port', process.env.PORT || 8000);
http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});