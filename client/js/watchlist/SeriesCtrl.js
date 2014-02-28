angular.module('oto').controller('SeriesCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {

   /*
    * Initial
    */

   $scope.showSearchResults = false;
   $scope.query = 'Dexter';
   $scope.searchResults = [];
   $scope.searching = false;
   
   $scope.addButtonText = 'Add';

   /*
    * Series
    */


   $scope.seriesCollection = [];
   $scope.loadingCollection = true;
   var getSeries = function() {
         $http.get('/api/watchlist/series/getcollection')
            .success(function(response) {
               $scope.seriesCollection = response;
               $scope.loadingCollection = false;
            })
            .error(function(response) {
               console.log(response.error);
               $scope.loadingCollection = false;
            });
   };
   getSeries();

   $scope.searchSeries = function() {
      if ($scope.query) {
         $scope.originalQuery = angular.copy($scope.query);
         $scope.searching = true;
         $scope.showSearchResults = true;
         $http.get('/api/watchlist/series/search', {params:{'query':$scope.query}})
            .success(function(response) {
               $scope.searchResults = response;
               $scope.searching = false;
            })
            .error(function(response) {
               console.log(response.error);
               $scope.searching = false;
            });
      }
   };

   $scope.addSeries = function(show) {
      var exists = _.find($scope.seriesCollection, function(inshow) {return inshow.seriesid==show.seriesid;});
      if (!exists) {
         $scope.addButtonText = '...';
         $http.post('/api/watchlist/series/addseries', {showid:show.seriesid})
            .success(function(show) {
               $scope.addButtonText = 'Add';
               $scope.seriesCollection.push(show);
            })
            .error(function(response) {
               $scope.addButtonText = 'Add';
               console.log(response.error);
            });
      } else {
         console.log('Already there');
         //ODO: alert user
      }
   };

   $scope.removeSeries = function(show, showindex) {
      $http.post('/api/watchlist/series/remove', {showid:show.seriesid})
         .success(function(response) {
            $scope.seriesCollection.splice(showindex, 1);
         })
         .error(function(response) {
            console.log(response.error);
         });
   };

   $scope.setLastDownloaded = function(show) {
      show.lastdownloaded=show.activeEpisode;
         $http.post('/api/watchlist/series/update', {showid:show.seriesid, lastdownloaded: show.activeEpisode})
            .success(function(response) {
               //console.log(response);
            })
            .error(function(response) {
               console.log(response.error);
            });
   };

   $scope.setLastWatched = function(show) {
      show.lastwatched=show.activeEpisode;
      $http.post('/api/watchlist/series/update', {showid:show.seriesid, lastwatched: show.activeEpisode})
         .success(function(response) {
            //console.log(response);
         })
         .error(function(response) {
            console.log(response.error);
         });
   };

   $scope.setActiveEpisode = function(series, ep) {
      if (series.activeEpisode==ep) {
         series.activeEpisode=null;
      } else {
         series.activeEpisode=ep;
      }
   };

   $scope.epIsNextAired = function(show, ep) {
      if (show.nextEpisode) {
         var seEp = ep.substring(0, ep.indexOf(' '));
         var seNext = show.nextEpisode.split(",")[1];
         if (seEp.trim() === seNext.trim()) {
            return true;
         }
      }
      return false;
   };

}]);

angular.module('oto').filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

