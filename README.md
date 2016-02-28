reStart-angular
==========

A mobile-first, responsive boilerplate in AngularJS with all basic features needed to get a scalable single page application started.

Currently supports modern browsers and IE9+. This boilerplate will attempt to stay in sync with latest Angular stable 
releases, so the browser support may change over time.

## Dependencies
 
* AngularJS v1.5.0
* jQuery v2.1.4
* Node >= v0.10 
* Gulp 
* Sass (Node/libsass, not Ruby)

## Style

* single responsibility 
* modular 
* scalable
* opinionated ESLint
* for more on style, see [https://github.com/johnpapa/angular-styleguide](Angular Styleguide)

## Features

* route resolve
* loading states
* sample API promises
* error handling
* mobile navigation
* mediaquery-based view switching
* utility filters
* example factories and directives 
* controller and directive namespacing
* mobile-first SCSS, reset, normalize
* jsDoc comments
* ESLint

## Demo

Demo available at [http://restart-angular.kmaida.io](http://restart-angular.kmaida.io)

## Run

Run `gulp` from command line to begin the server and watch tasks. Visit [http://localhost:8000]
(http://localhost:8000) in a browser window to view the site.

Run `gulp --prod` to use the `production` flag, minifying files (no server, no `watch`).

## Changelog

* 2/27/16: Upgrade to Angular 1.5.0
* 12/04/15: Add ESLint and upgrade to Angular 1.4.8
* 11/23/15: Rename module and folders for better scalability. Additional dependency upgrades and styleguide compliance edits.
* 11/16/15: App-wide updates to greatly enhance base features, upgrade dependencies, and comply much more fully with John Papa's AngularJS styleguide
* 10/18/15: Upgrade to Angular 1.4.7, upgrade `gulp-sass` to use latest and lowercase package name (for Node v4), add
 error response to `$http` promises
* 8/23/15: Add gulp `connect` and server task
* 8/19/15: Upgrade to Angular 1.4.4, upgrade to jQuery 2.1.4, fix `controllerAs` to reference named functions instead of using anonymous functions
* 5/29/15: Upgrade to Angular 1.4.0
* **release v0.2.0-beta** - 5/02/15: Refine Sass, update menu styles, get rid of anonymous functions, add jsDoc 
comments, add data, deploy demo