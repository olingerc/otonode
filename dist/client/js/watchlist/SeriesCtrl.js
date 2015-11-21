angular.module("oto").controller("SeriesCtrl",["$scope","$rootScope","$http","$timeout",function(a,b,c,d){a.showSearchResults=!1,a.query="Dexter",a.searchResults=[],a.searching=!1,a.savingAdd={},a.savingUpdate={},a.seriesCollection=[],a.loadingCollection=!0;var e=function(){c.get("/api/watchlist/series/getcollection").success(function(b){a.seriesCollection=b,a.loadingCollection=!1}).error(function(b){console.log(b.error),a.loadingCollection=!1})};e(),a.searchSeries=function(){a.query&&(a.originalQuery=angular.copy(a.query),a.searching=!0,a.showSearchResults=!0,c.get("/api/watchlist/series/search",{params:{query:a.query}}).success(function(b){a.searchResults=b,a.searching=!1}).error(function(b){console.log(b.error),a.searching=!1}))},a.addSeries=function(b){var e=_.find(a.seriesCollection,function(a){return a.seriesid==b.seriesid});e?(a.savingAdd[b.seriesid]="Already in collection",d(function(){a.savingAdd[b.seriesid]=!1},3e3),console.log("Already there")):(a.savingAdd[b.seriesid]="Saving",c.post("/api/watchlist/series/addseries",{showid:b.seriesid}).success(function(b){a.savingAdd[b.seriesid]=!1,a.seriesCollection.push(b)}).error(function(c){a.savingAdd[b.seriesid]="Error",console.error(c.error)}))},a.removeSeries=function(b,d){c.post("/api/watchlist/series/remove",{showid:b.seriesid}).success(function(b){a.seriesCollection.splice(d,1)}).error(function(a){console.log(a.error)})},a.setLastDownloaded=function(b){b.lastdownloaded=b.activeEpisode,a.savingUpdate[b.seriesid]="saving",c.post("/api/watchlist/series/update",{showid:b.seriesid,lastdownloaded:b.activeEpisode}).success(function(c){a.savingUpdate[b.seriesid]=!1}).error(function(c){a.savingUpdate[b.seriesid]="error",console.error(c.error)})},a.setLastWatched=function(b){b.lastwatched=b.activeEpisode,a.savingUpdate[b.seriesid]="saving",c.post("/api/watchlist/series/update",{showid:b.seriesid,lastwatched:b.activeEpisode}).success(function(c){a.savingUpdate[b.seriesid]=!1}).error(function(c){a.savingUpdate[b.seriesid]="error",console.error(c.error)})},a.setActiveEpisode=function(a,b){a.activeEpisode==b?a.activeEpisode=null:a.activeEpisode=b},a.epIsNextAired=function(a,b){if(a.nextEpisode){var c=b.substring(0,b.indexOf(" ")),d=a.nextEpisode.split(",")[1];if(c.trim()===d.trim())return!0}return!1}}]),angular.module("oto").filter("reverse",function(){return function(a){return a.slice().reverse()}});