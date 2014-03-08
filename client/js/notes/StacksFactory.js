angular.module('oto')
.factory('Stacks', ['$http', function($http) {
   var userStacks = [],
      floatingStack = null;

   return {
      getAll: function(callback) {
         allStacks = [];

         $http.get('/api/notes/stacks')
         .success(function(response) {
            //Only user stacks, archive stack does not exist and floating is handled differently
            jQuery.each(response, function(i, stack) {
               if (stack.title !== 'Archive' && stack.title !== 'Floating') {
                  allStacks.push(stack);
               }
               if (stack.title === 'Floating') {
                  floatingStack = stack;
               }
            });
            callback(allStacks, floatingStack);
         })
         .error(function(error) {
            console.log(error);
            callback([], null);
         });
      },
      add: function(newStackTitle, success, error) {
         var newStack = {
            'title' : newStackTitle
         };
         $http.post('/api/notes/stacks', newStack).success(success).error(error);
      },
      rename: function(stackid, newTitle, success, error) {
         $http.put('/api/notes/stacks/' + stackid, {
            'title' : newTitle
         }).success(success).error(error);
      },
      remove: function(stackid, success, error) {
         $http.delete ('/api/notes/stacks/' + stackid).success(success).error(error);
      }
   };
}]);
