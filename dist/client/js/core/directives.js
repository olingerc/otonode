"use strict";angular.module("oto").directive("accessLevel",["Auth",function(a){return{restrict:"A",link:function(b,c,d){function e(){f&&g&&(a.authorize(g,f)?c.css("display",h):c.css("display","none"))}var f,g,h=c.css("display");b.user=a.user,b.$watch("user",function(a){a.role&&(f=a.role),e()},!0),d.$observe("accessLevel",function(a){a&&(g=b.$eval(a)),e()})}}}]),angular.module("oto").directive("activeNav",["$location",function(a){function b(a){return"/"!==a[a.length-1]&&(a+="/"),a}return{restrict:"A",link:function(c,d,e){var f=d[0];"A"!=d[0].tagName.toUpperCase()&&(f=d.find("a")[0]);var g=f.href;c.location=a,c.$watch("location.absUrl()",function(a){g=b(g),a=b(a),g===a||"nestedTop"===e.activeNav&&0===a.indexOf(g)?d.addClass("active"):d.removeClass("active")})}}}]),angular.module("oto").directive("selectOnClick",function(){return{restrict:"A",link:function(a,b,c){b.on("click",function(){this.select()})}}});