!function(a){function b(a){var b="01",c={};for(var d in a){var e=parseInt(b,2);c[a[d]]={bitMask:e,title:a[d]},b=(e<<1).toString(2)}return c}function c(a,b){var c={};for(var d in a)if("string"==typeof a[d])if("*"==a[d]){var e="";for(var f in b)e+="1";c[d]={bitMask:parseInt(e,2)}}else console.log("Access Control Error: Could not parse '"+a[d]+"' as access definition for level '"+d+"'");else{var e=0;for(var f in a[d])b.hasOwnProperty(a[d][f])?e|=b[a[d][f]].bitMask:console.log("Access Control Error: Could not find role '"+a[d][f]+"' in registered roles while building access for '"+d+"'");c[d]={bitMask:e}}return c}var d={roles:["public","user","admin"],accessLevels:{"public":"*",anon:["public"],user:["user","admin"],admin:["admin"]}};a.userRoles=b(d.roles),a.accessLevels=c(d.accessLevels,a.userRoles)}("undefined"==typeof exports?this.routingConfig={}:exports);