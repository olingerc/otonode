angular.module('oto')
.factory('Cards', ['$http', function($http) {
   return {
      getAll: function(success, error) {
         $http.get('/api/notes/cards').success(success).error(error);
      },
      remove: function(cardid, success, error) {
         $http.delete('/api/notes/cards/' + cardid).success(success).error(error);
      },
      archive: function(cardid, stacktitleafterarchive, success, error) {
         $http.put('/api/notes/cards/' + cardid, {
            'archivedat' : new Date().toString(),
            'stacktitleafterarchived' : stacktitleafterarchive
         }).success(success).error(error);
      },
      move: function(cardid, stackid, success, error) {
         $http.put('/api/notes/cards/' + cardid, {
            'stackid' : stackid,
            'archivedat' : null,
            'stacktitleafterarchived' : null
         }).success(success).error(error);
      },
      setActiveCard: function(card) {
         this.activeCard.value = card; //primitive values not allowed: http://stackoverflow.com/questions/16133299/angularjs-cross-controller-factory-update
         //But cards are not primitives? Anaway using card directly without value does not work
      },
      activeCard:{value: null},
      getActiveCard: function() {
         return this.activeCard.value;
      }
   };
}]);
