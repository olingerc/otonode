angular.module('oto')
.controller('UsersCtrl',
['$rootScope', '$scope', 'Users', 'Auth', function($rootScope, $scope, Users, Auth) {
   
   /**
    * Initial values
    */
   $scope.loading = true;
   $scope.userRoles = Auth.userRoles;
   $scope.master = {};
   $scope.user = {};
   $scope.userFormState = {
      action: 'add',
      loadedIndex: null,
      errorAlreadyExists: false,
      errorFillAll: false
   };

   Users.getAll(function(res) {
      $scope.users = res;
      $scope.loading = false;
   }, function(err) {
      $rootScope.error = "Failed to fetch users.";
      $scope.loading = false;
   });

   $scope.update = function(user) {
      $scope.master = angular.copy(user);
   };

   $scope.isUnchanged = function(user) {
      return angular.equals(user, $scope.master);
   };

   $scope.userFormAction = function(user) {
      if ($scope.userFormState.action === 'add') {
         $scope.addUser(user);
      } else {
         $scope.confirmUpdate();
      }
   };

   $scope.addUser = function(user) {
      Users.add(user,
         function(res) {
            $scope.users.push(res);
            $scope.resetForm();
         },
         function(err) {
            if (err == 'Username already exists') {
               $scope.userFormState.errorAlreadyExists = true;
            }
            else if (err == 'Please fill all the required fields') {
               $scope.userFormState.errorFillAll = true;
            }
            else {
               console.log(err);
            }
         }
      );
   };

   $scope.updateUser = function(index) {
      $scope.userFormState.action = 'save';
      $scope.user  = angular.copy($scope.users[index]);
      $scope.master = angular.copy($scope.user);
      $scope.userFormState.loadedIndex = index;
   };

   $scope.confirmUpdate = function() {
      Users.update($scope.user, 
         function(user) {
            $scope.users[$scope.userFormState.loadedIndex] = user;//$scope.user;
            $scope.resetForm();            
         },
         function(err) {
            if (err == 'Username already exists') {
               $scope.userFormState.errorAlreadyExists = true;
            }
            else if (err == 'Please fill all the required fields') {
               $scope.userFormState.errorFillAll = true;
            }
            else {
               console.log(err);
            }            
         });
   };

   $scope.resetForm = function() {
      $scope.user = {};
      $scope.userFormState = {
         action: 'add',
         loadedIndex: null,
         errorAlreadyExists: false
      };
   };

   $scope.deleteUser = function(user) {
      //http://stackoverflow.com/questions/14250642/angularjs-how-to-remove-an-item-from-scope
      Users.remove(user,
         function (res) {
            $scope.users.splice($scope.users.indexOf(user), 1);
         },
         function(err) {
            console.log(err);
         }
      );
   };

}]);


angular.module('oto')
.controller('DBCtrl',
['$scope', '$http', function($scope, $http) {
   $scope.exportok = false;
   $scope.exporterror = false;
   $scope.exportprogress = false;

   $scope.exportDB = function () {
      $scope.exportprogress = true;
      $http.get('/exportdb') //TODO
      .success(function(response) {
         $scope.exportprogress = false;
         $scope.exportok = true;
      })
      .error(function(response) {
         $scope.exportprogress = false;
         $scope.exporterror = true;
      });
   };
}]);