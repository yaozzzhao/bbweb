/**
 * Administration package module.

 * Manages all sub-modules so other RequireJS modules only have to import the package.
 */
define([
  'angular',
  './controllers',
  './states',
  './centres/main',
  './studies/main'
], function(angular) {
  'use strict';

  return angular.module('biobank.admin', [
    'admin.controllers',
    'admin.states',
    'biobank.admin.centres',
    'biobank.admin.studies'
  ]);
});