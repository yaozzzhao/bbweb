/**
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2015 Canadian BioSample Repository (CBSR)
 */
define(['angular', 'lodash'], function(angular, _) {
  'use strict';

  ConcurrencySafeEntityFactory.$inject = [ '$q', 'biobankApi' ];

  /**
   * AngularJS factory for participants.
   *
   */
  function ConcurrencySafeEntityFactory($q, biobankApi) {

    /**
     * @classdesc Used to manage surrogate identity and optimistic concurrency versioning.
     * @class
     * @memberOf domain
     */
    function ConcurrencySafeEntity(obj) {
      /**
       * The unique ID that identifies an object of this type.
       * @name domain.ConcurrencySafeEntity#id
       * @type string
       * @private
       */
      this.id = null;

      /**
       * The current version for the object. Used for optimistic concurrency versioning.
       * @name domain.ConcurrencySafeEntity#version
       * @type number
       * @private
       */
      this.version = 0;

      /**
       * The date and time, in ISO time format, when this entity was added to the system.
       * @name domain.ConcurrencySafeEntity#timeAdded
       * @type Date
       * @private
       */
      this.timeAdded = null;

      /**
       * The date and time, in ISO time format, when this entity was last updated.
       * @name domain.ConcurrencySafeEntity#timeModified
       * @type Date
       * @private
       */
      this.timeModified = null;

      obj = obj || {};
      _.extend(this, obj);
    }

    /**
     * If the object does not have an ID it is new and is not yet present in the system.
     *
     * @returns {boolean}
     */
    ConcurrencySafeEntity.prototype.isNew = function() {
      return (this.id === null);
    };

    /** @protected */
    ConcurrencySafeEntity.prototype.update = function (url, additionalJson) {
      var self = this, json = _.extend({ expectedVersion: self.version }, additionalJson || {});
      return biobankApi.post(url, json).then(function(reply) {
        return self.asyncCreate(reply);
      });
    };

    /** @protected */
    ConcurrencySafeEntity.prototype.asyncCreate = function (obj) {
      var deferred = $q.defer();
      deferred.reject('derived class should override this method');
      return deferred.promise;
    };

    return ConcurrencySafeEntity;
  }

  return ConcurrencySafeEntityFactory;
});
