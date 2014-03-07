'use strict';

angular.module('oto', [
    'ngCookies',
    'ui.router',
    'ngTable',
    'oto.filters',
    'oto.filters',
    'ui.bootstrap',
    'ui.utils',
    'angularFileUpload'
    ])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

    var access = routingConfig.accessLevels;

    // Public routes
    $stateProvider
        .state('public', {
            abstract: true,
            template: "<ui-view/>",
            data: {
                access: access.public
            }
        })
        .state('public.404', {
            url: '/404/',
            templateUrl: '404'
        })
        .state('public.401', {
            url: '/401/',
            templateUrl: '401'
        });

    // Anonymous routes
    $stateProvider
        .state('anon', {
            abstract: true,
            template: "<ui-view/>",
            data: {
                access: access.anon
            }
        })
        .state('anon.login', {
            url: '/login/',
            templateUrl: 'login',
            controller: 'LoginCtrl'
        });

    // Regular user routes
    $stateProvider
        .state('user', {
            abstract: true,
            template: "<ui-view/>",
            data: {
                access: access.user
            }
        })
        .state('user.home', {
            url: '/',
            templateUrl: 'home',
            controller:     'HomeCtrl'
        })

        //Auto
        .state('user.automation', {
            url: '/automation/',
            templateUrl: 'automation',
            controller: 'AutomationCtrl'
        })

        //Notes
        .state('user.notes', {
            url: '/notes/',
            templateUrl: 'notes/card-list'
        })

        //Houehold
        .state('user.household', {
            abstract: true,
            url: '/household/',
            template: "<ui-view/>",
            data: {
               subnav: 'household/subnav'
            }
        })
        .state('user.household.compensate', {
            url: '',
            templateUrl: 'household/compensate',
            controller:     'CompensateCtrl'
        })
        .state('user.household.kitties', {
            url: 'kitties/',
            templateUrl: 'household/kitties',
            controller:     'KittiesCtrl'
        })

        //Watchlist
        .state('user.watchlist', {
            abstract: true,
            url: '/watchlist/',
            template: "<ui-view/>",
            data: {
               subnav: 'watchlist/subnav'
            }
        })
        .state('user.watchlist.series', {
            url: 'series/',
            templateUrl: 'watchlist/series',
            controller:     'SeriesCtrl'
        });

    // Admin routes
    $stateProvider
        .state('admin', {
            abstract: true,
            template: "<ui-view/>",
            data: {
                access: access.admin
            }
        })
        .state('admin.admin', {
            url: '/admin/',
            templateUrl: 'admin'
        });



    $urlRouterProvider.when('/watchlist/', '/watchlist/series');

    $urlRouterProvider.otherwise('/404');



    // FIX for trailing slashes. Gracefully "borrowed" from https://github.com/angular-ui/ui-router/issues/50
    $urlRouterProvider.rule(function($injector, $location) {
        if($location.protocol() === 'file')
            return;

        var path = $location.path()
        // Note: misnomer. This returns a query object, not a search string
            , search = $location.search()
            , params
            ;

        // check to see if the path already ends in '/'
        if (path[path.length - 1] === '/') {
            return;
        }

        // If there was no search string / query params, return with a `/`
        if (Object.keys(search).length === 0) {
            return path + '/';
        }

        // Otherwise build the search string and return a `/?` prefix
        params = [];
        angular.forEach(search, function(v, k){
            params.push(k + '=' + v);
        });
        return path + '/?' + params.join('&');
    });

    $locationProvider.html5Mode(true);

    $httpProvider.interceptors.push(function($q, $location) {
        return {
            'responseError': function(response) {
                if(response.status === 401 || response.status === 403) {
                    $location.path('/401');
                    return $q.reject(response);
                }
                else {
                    return $q.reject(response);
                }
            }
        };
    });

}])

   .run(['$rootScope', '$state', 'Auth', function ($rootScope, $state, Auth) {
        //init rootscope objects. I want to have separete objects for my modules
       $rootScope.core = {};
       $rootScope.core.subnav = null;
       $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
          //Handle subnav
          if (toState.data.subnav) $rootScope.core.subnav = toState.data.subnav;
          else $rootScope.core.subnav = null;

          //Handle authorization
           if (!Auth.authorize(toState.data.access)) {
               $rootScope.error = "Seems like you tried accessing a route you don't have access to...";
               event.preventDefault();

               if(fromState.url === '^') {
                   if(Auth.isLoggedIn()) {
                       $state.go('user.home');
                       $rootScope.error = "";
                   } else {
                       $rootScope.error = null;
                       $rootScope.core.savedLocation = toState.url;
                       $state.go('anon.login');
                   }
               }
           }
       });

    }]);