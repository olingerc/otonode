angular.module('oto').controller('HouseholdCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
   $scope.test1 = 'Init';
   $http.get('/householdapi/all').success(function(resp) {
      $scope.test1 = JSON.stringify(resp);
   });

   $scope.test2 = 'Init';
   $http.get('/householdapi/one').success(function(resp) {
      $scope.test2 = JSON.stringify(resp);
   });
}]);
