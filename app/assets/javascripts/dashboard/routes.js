/**
 * Dashboard routes.
 */
define(['angular', './controllers', 'common'], function(angular, controllers) {
  'use strict';

  var mod = angular.module('dashboard.routes', ['biobank.common']);
  mod.config(['$routeProvider', 'userResolve', function($routeProvider, userResolve) {
    $routeProvider
      .when(
        '/dashboard',  {
          templateUrl: '/assets/javascripts/dashboard/dashboard.html',
          controller:controllers.DashboardCtrl,
          resolve:userResolve})
      .when(
        '/admin/dashboard',  {
          templateUrl: '/assets/javascripts/dashboard/admin.html',
          controller:controllers.AdminDashboardCtrl,
          resolve:userResolve});
  }]);
  return mod;
});
