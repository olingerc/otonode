var _ =           require('underscore')
    , userRoles = require('../../client/js/core/routingConfig').userRoles
    , accessLevels = require('../../client/js/core/routingConfig').accessLevels;

module.exports = function(app, routes) {

    _.each(routes, function(route) {
        route.middleware.unshift(ensureRouteAuthorized);
        var args = _.flatten([route.path, route.middleware]);

        switch(route.httpMethod.toUpperCase()) {
            case 'GET':
                app.get.apply(app, args);
                break;
            case 'POST':
                app.post.apply(app, args);
                break;
            case 'PUT':
                app.put.apply(app, args);
                break;
            case 'DELETE':
                app.delete.apply(app, args);
                break;
            default:
                throw new Error('Invalid HTTP method specified for route ' + route.path);
                break;
        }
    });


      function ensureRouteAuthorized(req, res, next) {
          var role;
          if(!req.user) role = userRoles.public;
          else          role = req.user.role;

          var accessLevel = _.findWhere(routes, { path: req.route.path }).accessLevel || accessLevels.public;

          if(!(accessLevel.bitMask & role.bitMask)) return res.send(403);
          return next();
      }
};

