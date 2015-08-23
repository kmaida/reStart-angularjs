reStart-angular
==========

A mobile-first, responsive boilerplate in AngularJS.

Currently supports modern browsers and IE9+. This framework will attempt to stay in sync with latest Angular stable 
releases, so the browser support may change over time.

## Dependencies
 
* AngularJS v1.4.4
* jQuery v2.1.4
* Node >= 0.10 
* Gulp 
* Sass

## Features

* single responsibility 
* mostly flat file structure
* modular 
* mediaquery-based view switching
* example services, factories, filters, directives 
* for more on style, see [https://github.com/johnpapa/angular-styleguide](Angular Styleguide)

## Demo

Demo available at [http://restart-angular.kmaida.io](http://restart-angular.kmaida.io)

## Run

Run `gulp` from command line to begin the server and watch tasks. Visit [http://localhost:8000]
(http://localhost:8000) in a browser window to view the site.

Run `gulp --prod` to use the `production` flag, minifying files (no server, no `watch`).

## Changelog

* 8/23/15: Add gulp `connect` and server task
* 8/19/15: Upgrade to Angular 1.4.4, upgrade to jQuery 2.1.4, fix `controllerAs` to reference named functions instead of using anonymous functions
* 5/29/15: Upgrade to Angular 1.4.0
* **release v0.2.0-beta** - 5/02/15: Refine Sass, update menu styles, get rid of anonymous functions, add jsDoc 
comments, add data, deploy demo