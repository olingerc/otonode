var express =       require('express')
    , http =        require('http')
    , passport =    require('passport')
    , path =        require('path')
    , User_Ctrl =   require('./server/core/controllers/user.js')
    , _ =           require('underscore')
    , mongoose =    require('mongoose')
    , util =        require('util')
    , formidable = require('formidable');

/**
 * Define environment. Can be pre-set via grunt already
 */

process.env.NODE_ENV = process.env.NODE_ENV || 'development';


//Initialize system variables
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

app.use('/uploads', express.static('/home/christophe/otouploads'));

app.use(express.static(path.join(__dirname, 'client')));

app.use(express.cookieParser());
app.use(express.cookieSession({secret: config.sessionSecret}));

/*app.use(function(err, req, res, next){
    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
      // parse a file upload
      var form = new formidable.IncomingForm();

      form.parse(req, function(err, fields, files) {
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
        res.end(util.inspect({fields: fields, files: files}));
      });
    }
});*/



app.configure('development', 'production', function() {
    app.use(express.csrf());
    app.use(function(req, res, next) {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        res.locals.csrftoken = req.csrfToken();
        next();
    });
});

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
 * AUTHENTICATION
 */

// Load passposrt config
require('./config/passport')(passport);
//make sure at least one admin user exists
User_Ctrl.checkAdminMinimum();

app.use(passport.initialize());
app.use(passport.session());

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
 * Start Server
 */
app.set('port', process.env.PORT || config.port);
http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});