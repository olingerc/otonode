'use strict';

angular.module('oto')
.factory('Auth', function($http, $cookieStore, $rootScope, $cookies){

    var accessLevels = routingConfig.accessLevels
        , userRoles = routingConfig.userRoles
        , currentUser = $cookieStore.get('user') || { username: '', role: userRoles.public }
        , xsrfToken = $cookies['XSRF-TOKEN'] || null;

    $cookieStore.remove('user');

    function changeUser(user) {
        _.extend(currentUser, user);
    };

    return {
        authorize: function(accessLevel, role) {
            if(role === undefined)
                role = currentUser.role;

            return accessLevel.bitMask & role.bitMask;
        },
        isLoggedIn: function(user) {
            if(user === undefined)
                user = currentUser;
            return user.role.title == userRoles.user.title || user.role.title == userRoles.admin.title;
        },
        register: function(user, success, error) {
            $http.post('/register', user).success(function(res) {
                console.log(headers())
                changeUser(res);
                success();
            }).error(error);
        },
        login: function(user, success, error) {
            $http.post('/login', user).success(function(user){
                changeUser(user);
                success(user);
            }).error(error);
        },
        logout: function(success, error) {
            $http.post('/logout').success(function(){
                changeUser({
                    username: '',
                    role: userRoles.public
                });
                success();
                $rootScope.core.savedLocation = null;
            }).error(error);
        },
        accessLevels: accessLevels,
        userRoles: userRoles,
        user: currentUser,
        xsrfToken: xsrfToken
    };
});

angular.module('oto')
.factory('Users', function($http) {
    return {
        getAll: function(success, error) {
            $http.get('/users').success(success).error(error);
        },
        remove: function(user, success, error) {
           $http.delete ('/users/' + user._id).success(success).error(error);
        },
        add: function(user, success, error) {
           $http.post ('/users', user).success(success).error(error);
        },
        update: function(user, success, error) {
           $http.put ('/users/' + user._id, user).success(success).error(error);
        }
    };
});
