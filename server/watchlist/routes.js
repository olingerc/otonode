var seriesCtrl =      require('./controllers/series')
  , accessLevels =   require('../../client/js/core/routingConfig').accessLevels;

//this combines the controller with accessLevel cotntrol and GET, POST check

module.exports = [
   {
      path: '/api/watchlist/series/search',
      httpMethod: 'GET',
      middleware: [seriesCtrl.search],
      accessLevel: accessLevels.user
   },
   {
      path: '/api/watchlist/series/thumb/:seriesid',
      httpMethod: 'GET',
      middleware: [seriesCtrl.thumb],
      accessLevel: accessLevels.user
   }
];
