angular.module('oto').controller('KittiesCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
   $http.get('/api/household/all').success(function(resp) {
      $scope.kitties = resp;
   });

   $scope.newkitty = function() {
      $http.post('/api/household/create', {'name' :$scope.kittyname}).success(function(kitty) {
         $scope.kitties.push(kitty);
      });
   };
}]);
