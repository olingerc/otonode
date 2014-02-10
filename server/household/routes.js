var household =      require('./controllers/kitty')
  , accessLevels =   require('../../client/js/core/routingConfig').accessLevels;

//this combines the controller with accessLevel cotntrol and GET, POST check

module.exports = [
   {
      path: '/api/household/all',
      httpMethod: 'GET',
      middleware: [household.all],
      accessLevel: accessLevels.user
   },
   {
      path: '/api/household/create',
      httpMethod: 'POST',
      middleware: [household.create],
      accessLevel: accessLevels.user
   }
];
