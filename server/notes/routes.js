var accessLevels =   require('../../client/js/core/routingConfig').accessLevels,
   stacks = require('./controllers/stacks'),
   cards = require('./controllers/cards');

module.exports = [
   {
      path: '/api/notes/stacks',
      httpMethod: 'GET',
      middleware: [stacks.getall],
      accessLevel: accessLevels.user
   },
   {
      path: '/api/notes/cards',
      httpMethod: 'GET',
      middleware: [cards.getall],
      accessLevel: accessLevels.user
   }
];
