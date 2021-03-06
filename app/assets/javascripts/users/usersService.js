/**
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2015 Canadian BioSample Repository (CBSR)
 */
define(['lodash'], function(_) {
  'use strict';

  usersServiceFactory.$inject = ['$q', '$cookies', '$log', 'biobankApi'];

  /**
   * Communicates with the server to get user related information and perform user related commands.
   */
  function usersServiceFactory($q,
                               $cookies,
                               $log,
                               biobankApi) {
    var currentUser;

    var service = {
      getCurrentUser:     getCurrentUser,
      requestCurrentUser: requestCurrentUser,
      login:              login,
      logout:             logout,
      isAuthenticated:    isAuthenticated,
      sessionTimeout:     sessionTimeout,
      passwordReset:      passwordReset
    };

    init();
    return service;

    //-------

    /* If the token is assigned, check that the token is still valid on the server */
    function init() {
      var token = $cookies.get('XSRF-TOKEN');

      if (!token) { return; }

      biobankApi.get('/authenticate')
        .then(function(user) {
          currentUser = user;
          $log.info('Welcome back, ' + currentUser.name);
        })
        .catch(function() {
          /* the token is no longer valid */
          $log.info('Token no longer valid, please log in.');
          currentUser = undefined;
          $cookies.remove('XSRF-TOKEN');
          return $q.reject('Token invalid');
        });
    }

    function requestCurrentUser() {
      if (isAuthenticated()) {
        return $q.when(currentUser);
      }

      return biobankApi.get('/authenticate').then(function(user) {
        currentUser = user;
        return currentUser;
      });
    }

    function getCurrentUser() {
      return currentUser;
    }

    function isAuthenticated() {
      return !!currentUser;
    }

    function login(credentials) {
      return biobankApi.post('/login', credentials)
        .then(function(reply) {
          return biobankApi.get('/authenticate');
        })
        .then(function(user) {
          currentUser = user;
          $log.info('Welcome ' + currentUser.name);
          return currentUser;
        });
    }

    function logout() {
      return biobankApi.post('/logout').then(function() {
        $log.info('Good bye');
        $cookies.remove('XSRF-TOKEN');
        currentUser = undefined;
      });
    }

    function sessionTimeout() {
      $cookies.remove('XSRF-TOKEN');
      currentUser = undefined;
    }

    function passwordReset(email) {
      return biobankApi.post('/passreset', { email: email });
    }

  }

  return usersServiceFactory;
});
