/**
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2015 Canadian BioSample Repository (CBSR)
 */
define(['angular', 'lodash', 'sprintf', 'tv4'], function(angular, _, sprintf, tv4) {
  'use strict';

  StudyFactory.$inject = [
    '$q',
    'funutils',
    'biobankApi',
    'ConcurrencySafeEntity',
    'DomainError',
    'StudyStatus',
    'studyStatusLabel',
    'AnnotationType',
    'hasAnnotationTypes'
  ];

  /**
   * Angular factory for Studies.
   */
  function StudyFactory($q,
                        funutils,
                        biobankApi,
                        ConcurrencySafeEntity,
                        DomainError,
                        StudyStatus,
                        studyStatusLabel,
                        AnnotationType,
                        hasAnnotationTypes) {

    /**
     * Used for validating plain objects.
     */
    var schema = {
      'id': 'Study',
      'type': 'object',
      'properties': {
        'id':              { 'type': 'string' },
        'version':         { 'type': 'integer', 'minimum': 0 },
        'timeAdded':       { 'type': 'string' },
        'timeModified':    { 'type': [ 'string', 'null' ] },
        'name':            { 'type': 'string' },
        'description':     { 'type': [ 'string', 'null' ] },
        'annotationTypes': { 'type': 'array' },
        'status':          { 'type': 'string' }
      },
      'required': [ 'id', 'version', 'timeAdded', 'name', 'status' ]
    };

    /**
     * Use this contructor to create new Study to be persited on the server. Use [create()]{@link
     * domain.studies.Study.create} or [asyncCreate()]{@link domain.studies.Study.asyncCreate} to create
     * objects returned by the server.
     *
     * @class
     * @memberOf domain.studies
     * @extends domain.ConcurrencySafeEntity
     *
     * @classdesc A Study represents a collection of participants and specimens collected for a particular
     * research study.
     *
     * @param {object} [obj={}] - An initialization object whose properties are the same as the members from
     * this class. Objects of this type are usually returned by the server's REST API.
     */
    function Study(obj) {

      /**
       * A short identifying name that is unique.
       *
       * @name domain.studies.Study#name
       * @type {string}
       */
      this.name = '';

      /**
       * A description that can provide additional details on the name.
       *
       * @name domain.studies.Study#description
       * @type {string}
       * @default null
       */
      this.description = null;

      /**
       * The annotation types associated with participants of this study.
       *
       * @name domain.studies.Study#annotationTypes
       * @type {Array<domain.AnnotationType>}
       */
      this.annotationTypes = [];

      /**
       * The status can be one of: enabled, disabled, or retired.
       *
       * @name domain.studies.Study#status
       * @type {domain.studies.StudyStatus}
       */
      this.status = StudyStatus.DISABLED;

      obj = obj || {};
      ConcurrencySafeEntity.call(this, obj);
      _.extend(this, obj);
      this.statusLabel = studyStatusLabel.statusToLabel(this.status);

      this.annotationTypes = _.map(this.annotationTypes, function (annotationType) {
        return new AnnotationType(annotationType);
      });
    }

    Study.prototype = Object.create(ConcurrencySafeEntity.prototype);
    _.extend(Study.prototype, hasAnnotationTypes);

    Study.prototype.constructor = Study;

    /**
     * Checks if <tt>obj</tt> has valid properties to construct a {@link domain.studies.Study|Study}.
     *
     * @param {object} [obj={}] - An initialization object whose properties are the same as the members from
     * this class. Objects of this type are usually returned by the server's REST API.
     *
     * @returns {domain.Validation} The validation passes if <tt>obj</tt> has a valid schema.
     */
    Study.validate = function (obj) {
      if (!tv4.validate(obj, schema)) {
        console.error('invalid object from server: ' + tv4.error);
        return { valid: false, message: 'invalid object from server: ' + tv4.error };
      }

      obj.annotationTypes = obj.annotationTypes || {};

      if (!hasAnnotationTypes.validAnnotationTypes(obj.annotationTypes)) {
        return { valid: false, message: 'invalid object from server: bad annotation types: ' + tv4.error };
      }

      return { valid: true, message: null };
    };

    /**
     * @typedef domain.studies.StudyNameDto
     * @type object
     * @property {String} id - the study's identity
     * @property {String} name - the study's name
     * @property {String} status - the study's status
     */

    /**
     * Returns the names of all the studies in the system.
     *
     * @returns {Promise<Array<domain.studies.StudyNameDto>>} The names of the studies in the system.
     */
    Study.names = function () {
      return biobankApi.get('/studies/names');
    };

    /**
     * Adds a study.
     *
     * @return {Promise<domain.studies.Study>} A promise containing the study that was created.
     */
    Study.prototype.add = function () {
      var self = this,
          json = { name: this.name };
      angular.extend(json, funutils.pickOptional(self, 'description'));
      return biobankApi.post(uri(), json).then(function(reply) {
        return Study.asyncCreate(reply);
      });
    };

    /**
     * Creates a Study from a server reply but first validates that it has a valid schema.
     *
     * <p>A wrapper for {@link domian.studies.Study#asyncCreate}.</p>
     *
     * @see domain.ConcurrencySafeEntity.update
     */
    Study.prototype.asyncCreate = function (obj) {
      return Study.asyncCreate(obj);
    };


    /**
     * Updates the Study's name.
     *
     * @param {String} name - The new name to give this study.
     *
     * @returns {Promise<domain.studies.Study>} A promise containing the study with the new name.
     */
    Study.prototype.updateName = function (name) {
      return this.update.call(this, uri('name', this.id), { name: name });
    };

    /**
     * Updates the Study's description.
     *
     * @param {String} description - The new description to give this study. When description is
     * <code>falsy</code>, the description will be cleared.
     *
     * @returns {Promise<domain.studies.Study>} A promise containing the study with the new description.
     */
    Study.prototype.updateDescription = function (description) {
      return this.update.call(this,
                              uri('description', this.id),
                              description ? { description: description } : {});
    };

    /**
     * Adds an annotation type to be used on participants of this study.
     *
     * @param {domain.AnnotationType} annotationType - the annotation type to add to this study.
     *
     * @returns {Promise<domain.studies.Study>} A promise containing the study with the new annotation type.
     */
    Study.prototype.addAnnotationType = function (annotationType) {
      return this.update.call(this,
                              uri('pannottype', this.id),
                              _.omit(annotationType, 'uniqueId'));
    };

    /**
     * Updates an existing annotation type for a participant.
     *
     * @param {domain.AnnotationType} annotationType - the annotation type with the new values.
     *
     * @returns {Promise<domain.studies.Study>} A promise containing the study with the updated annotation
     * type.
     */
    Study.prototype.updateAnnotationType = function (annotationType) {
      return this.update.call(this,
                              uri('pannottype', this.id) + '/' + annotationType.uniqueId,
                              annotationType);
    };

    /**
     * Removes an existing annotation type for a participant.
     *
     * @param {domain.AnnotationType} annotationType - the annotation type to remove.
     *
     * @returns {Promise<domain.studies.Study>} A promise containing the study with the removed annotation
     * type.
     */
    Study.prototype.removeAnnotationType = function (annotationType) {
      var url = sprintf.sprintf('%s/%d/%s',
                                uri('pannottype', this.id), this.version, annotationType.uniqueId);
      return hasAnnotationTypes.removeAnnotationType.call(this, annotationType, url);
    };

    /**
     * Disables a study.
     *
     * @throws An error if the study is already disabled.
     *
     * @returns {Promise<domain.studies.Study>} A promise containing the study with the new status.
     */
    Study.prototype.disable = function () {
      if (this.isDisabled()) {
        throw new DomainError('already disabled');
      }
      return changeState.call(this, 'disable');
    };

    /**
     * Enables a study.
     *
     * @throws An error if the study is already enabled.
     *
     * @returns {Promise<domain.studies.Study>} A promise containing the study with the new status.
     */
    Study.prototype.enable = function () {
      if (this.isEnabled()) {
        throw new DomainError('already enabled');
      }
      return changeState.call(this, 'enable');
    };

    /**
     * Retires a study.
     *
     * @throws An error if the study is already retired.
     *
     * @returns {Promise<domain.studies.Study>} A promise containing the study with the new status.
     */
    Study.prototype.retire = function () {
      if (this.isRetired()) {
        throw new DomainError('already retired');
      }
      return changeState.call(this, 'retire');
    };

    /**
     * Unretires a study. The study will be in <code>disabled</code> state after it is unretired.
     *
     * @throws An error if the study is not retired.
     *
     * @returns {Promise<domain.studies.Study>} A promise containing the study with the new status.
     */
    Study.prototype.unretire = function () {
      if (!this.isRetired()) {
        throw new DomainError('not retired');
      }
      return changeState.call(this, 'unretire');
    };

    /**
     * Used to query the study's current status.
     *
     * @returns {boolean} <code>true</code> if the study is in <code>disabled</code> state.
     */
    Study.prototype.isDisabled = function () {
      return (this.status === StudyStatus.DISABLED);
    };

    /**
     * Used to query the study's current status.
     *
     * @returns {boolean} <code>true</code> if the study is in <code>enabled</code> state.
     */
    Study.prototype.isEnabled = function () {
      return (this.status === StudyStatus.ENABLED);
    };

    /**
     * Used to query the study's current status.
     *
     * @returns {boolean} <code>true</code> if the study is in <code>retired</code> state.
     */
    Study.prototype.isRetired = function () {
      return (this.status === StudyStatus.RETIRED);
    };

    /**
     * Returns all locations for all the centres associated with this study.
     *
     * @returns {Promise<Array<domain.centres.CentreLocationDto>>} A promise.
     *
     * @see [Centre.centreLocationToNames()]{@link domain.centres.Centre.centreLocationToNames}
     */
    Study.prototype.allLocations = function () {
      return biobankApi.get('/studies/centres/' + this.id);
    };

    function changeState(state) {
      /* jshint validthis:true */
      var self = this,
          json = { expectedVersion: self.version };

      return biobankApi.post(uri(state, self.id), json).then(function (reply) {
        return Study.asyncCreate(reply);
      });
    }

    function uri(/* path, studyId */) {
      var args = _.toArray(arguments),
          studyId,
          path,
          result = '/studies';

      if (args.length > 0) {
        path = args.shift();
        result += '/' + path;
      }

      if (args.length > 0) {
        studyId = args.shift();
        result += '/' + studyId;
      }

      return result;
    }

    return Study;
  }

  return StudyFactory;
});
