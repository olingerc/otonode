otonode
=======

This is my personal learning ground for web development technologies. It also provides a nice way to organize myself and my family.
Uses angular and node

* Initial inspiration:
   *https://github.com/fnakstad/angular-client-side-auth (Copyright (c) 2013 Frederik Nakstad)
   *[MEAN stack](http://mean.io/)

I try to keep things modular on both client and server. That means each module gets an own folder on the client and on the server.
On client, module is configured in app.js (views preloaded in index.jade with id to get jade-->html), don't forget to add links wherever needed, e.g. navigation header)
On server, modules are loaded in server.js before the core routing
Configuration of modules goes into config/modules.js

Prerequisites:
from ubuntu: 
node, (special ppa from chris lea)

global npm:

Production:
bower

Development additionally:
grunt-cli


Install deps:
npm install --production -l  (the -l is for production)

Run porudctio:
NODE_ENV=production node server.js