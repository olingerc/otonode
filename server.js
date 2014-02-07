var express =       require('express')
    , http =        require('http')
    , passport =    require('passport')
    , path =        require('path')
    , User =        require('./server/core/models/User.js');


/**
 * Define environment. Can be pre-set via grunt already
 */

process.env.NODE_ENV = process.env.NODE_ENV || 'development';


var app = module.exports = express();


app.set('views', __dirname + '/client/js/core');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'client')));
app.use(express.cookieParser());
app.use(express.cookieSession(
    {
        secret: process.env.COOKIE_SECRET || "E&R:f>+2s70cy~SpZp4%b(7rb`s!PCxSuD3@po)/M)14{gW-;&5mp3te[+#$k^Oq')"
    }));

app.configure('development', 'production', function() {
    app.use(express.csrf());
    app.use(function(req, res, next) {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        next();
    });
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.localStrategy);
passport.use(User.googleStrategy());   // Comment out this line if you don't want to enable login via Google

passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);

require('./server/core/routes.js')(app);

app.set('port', process.env.PORT || 8000);
http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});