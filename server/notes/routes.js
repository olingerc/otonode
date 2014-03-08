var accessLevels =   require('../../client/js/core/routingConfig').accessLevels,
   stacks = require('./controllers/stacks'),
   cards = require('./controllers/cards'),
   attachments = require('./controllers/attachments');

module.exports = [
//STACKS
   {
      path: '/api/notes/stacks',
      httpMethod: 'GET',
      middleware: [stacks.getall],
      accessLevel: accessLevels.user
   },
   {
      path: '/api/notes/stacks',
      httpMethod: 'POST',
      middleware: [stacks.post],
      accessLevel: accessLevels.user
   },
   {
      path: '/api/notes/stacks/:stackid',
      httpMethod: 'PUT',
      middleware: [stacks.put],
      accessLevel: accessLevels.user
   },
   {
      path: '/api/notes/stacks/:stackid',
      httpMethod: 'DELETE',
      middleware: [stacks.delete],
      accessLevel: accessLevels.user
   },

//CARDS
   {
      path: '/api/notes/cards',
      httpMethod: 'GET',
      middleware: [cards.getall],
      accessLevel: accessLevels.user
   },
//Thumbnails
   {
      path: '/thumbnail/:attid',
      httpMethod: 'GET',
      middleware: [attachments.get],
      accessLevel: accessLevels.user
   }

];
