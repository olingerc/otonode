angular.module('oto').controller('SeriesCtrl', ['$scope', '$rootScope', '$http', '$timeout', function($scope, $rootScope, $http, $timeout) {

   /*
    * Initial
    */

   $scope.showSearchResults = false;
   $scope.query = 'Dexter';
   $scope.searchResults = [];
   $scope.searching = false;
   $scope.savingAdd = {};
   $scope.savingUpdate = {}; 

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
         $scope.savingAdd[show.seriesid] = 'Saving';
         $http.post('/api/watchlist/series/addseries', {showid:show.seriesid})
            .success(function(show) {
               $scope.savingAdd[show.seriesid] = false;
               $scope.seriesCollection.push(show);
            })
            .error(function(response) {
               $scope.savingAdd[show.seriesid] = 'Error';
               console.error(response.error);
            });
      } else {
         $scope.savingAdd[show.seriesid] = 'Already in collection';
         $timeout(function() {
            $scope.savingAdd[show.seriesid] = false;
         },3000);
         console.log('Already there');
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
         $scope.savingUpdate[show.seriesid] = 'saving';
         $http.post('/api/watchlist/series/update', {showid:show.seriesid, lastdownloaded: show.activeEpisode})
            .success(function(response) {
               $scope.savingUpdate[show.seriesid] = false;
            })
            .error(function(response) {
               $scope.savingUpdate[show.seriesid] = 'error';
               console.error(response.error);
            });
   };

   $scope.setLastWatched = function(show) {
      show.lastwatched=show.activeEpisode;
      $scope.savingUpdate[show.seriesid] = 'saving';
      $http.post('/api/watchlist/series/update', {showid:show.seriesid, lastwatched: show.activeEpisode})
            .success(function(response) {
               $scope.savingUpdate[show.seriesid] = false;
            })
            .error(function(response) {
               $scope.savingUpdate[show.seriesid] = 'error';
               console.error(response.error);
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

