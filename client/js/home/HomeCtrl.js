angular.module('oto')
.controller('HomeCtrl',
['$scope', 'Auth', function($scope, Auth) {
   $scope.accessLevels = Auth.accessLevels;
}]);
