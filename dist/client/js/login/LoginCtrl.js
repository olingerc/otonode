angular.module("oto").controller("LoginCtrl",["$rootScope","$scope","$location","$window","Auth",function(a,b,c,d,e){b.loginFormState={loginError:!1},b.rememberme=!0,b.login=function(){e.login({username:b.username,password:b.password,rememberme:b.rememberme},function(b){a.core.savedLocation&&"/login"!==a.core.savedLocation?c.path(a.core.savedLocation):c.path("/")},function(a){b.loginFormState.loginError=!0})},b.loginOauth=function(a){d.location.href="/auth/"+a}}]);