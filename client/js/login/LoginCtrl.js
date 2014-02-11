angular.module('oto').controller('LoginCtrl', ['$rootScope', '$scope', '$location', '$window', 'Auth', function($rootScope, $scope, $location, $window, Auth) {
   $scope.loginFormState = {
      loginError: false
   };
   $scope.rememberme = true;

   $scope.login = function() {
      Auth.login({
            username: $scope.username,
            password: $scope.password,
            rememberme: $scope.rememberme
         },
         function(res) {
            if ($rootScope.core.savedLocation && $rootScope.core.savedLocation !== '/login') {
               $location.path($rootScope.core.savedLocation);
            } else {
               $location.path('/');
            }
         },
         function(err) {
            $scope.loginFormState.loginError = true;
         });
    };

    $scope.loginOauth = function(provider) {
        $window.location.href = '/auth/' + provider;
    };
}]);