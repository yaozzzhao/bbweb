/**
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2015 Canadian BioSample Repository (CBSR)
 */
define(['lodash', 'tv4', 'sprintf'], function(_, tv4, sprintf) {
  'use strict';

  ParticipantFactory.$inject = [
    '$q',
    'funutils',
    'ConcurrencySafeEntity',
    'DomainError',
    'biobankApi',
    'hasAnnotations'
  ];

  /**
   * Factory for participants.
   */
  function ParticipantFactory($q,
                              funutils,
                              ConcurrencySafeEntity,
                              DomainError,
                              biobankApi,
                              hasAnnotations) {

    var schema = {
      'id': 'Participant',
      'type': 'object',
      'properties': {
        'id':              { 'type': 'string' },
        'version':         { 'type': 'integer', 'minimum': 0 },
        'timeAdded':       { 'type': 'string' },
        'timeModified':    { 'type': [ 'string', 'null' ] },
        'uniqueId':        { 'type': 'string' },
        'annotations':     { 'type': 'array' }
      },
      'required': [ 'id', 'studyId', 'uniqueId', 'annotations', 'version' ]
    };

    /**
     * Use this contructor to create a new Participant to be persited on the server. Use [create()]{@link
     * domain.studies.Participant.create} or [asyncCreate()]{@link domain.studies.Particiapnt.asyncCreate} to
     * create objects returned by the server.
     *
     * @classdesc The subject for which a set of specimens were collected from. The subject can be human or
     * non human. A participant belongs to a single [Study]{@link domain.studies.Study}.
     *
     * @class
     * @memberOf domain.studies
     * @extends domain.ConcurrencySafeEntity
     *
     * To convert server side annotations to Annotation class call setAnnotationTypes().
     *
     * @param {object} [obj={}] - An initialization object whose properties are the same as the members from
     * this class. Objects of this type are usually returned by the server's REST API.
     *
     */
    function Participant(obj, study) {
      /**
       * A participant has a unique identifier that is used to identify the participant in the system. This
       * identifier is not the same as the <code>id</code> value object used by the domain model.
       *
       * @name domain.studies.Participant#uniqueId
       * @type {string}
       */
      this.uniqueId = null;

      /**
       * The study identifier for the [Study]{@link domain.studies.Study} this participant belongs to.
       *
       * @name domain.studies.Participant#studyId
       * @type {string}
       */
      this.studyId = null;

      /**
       * The values of the [Annotations]{@link domain.Annotation} collected for this participant.
       *
       * @name domain.studies.Participant#annotations
       * @type {Array<domain.Annotation>}
       */
      this.annotations = [];

      obj = obj || {};
      ConcurrencySafeEntity.call(this);
      _.extend(this, obj);

      if (study) {
        this.setStudy(study);
      }
    }

    Participant.prototype = Object.create(ConcurrencySafeEntity.prototype);
    _.extend(Participant.prototype, hasAnnotations);
    Participant.prototype.constructor = Participant;

    /**
     * Creates a Study, but first it validates <code>obj</code> to ensure that it has a valid schema.
     *
     * @param {object} [obj={}] - An initialization object whose properties are the same as the members from
     * this class. Objects of this type are usually returned by the server's REST API.
     *
     * @returns {Study} A study created from the given object.
     *
     * @see [asyncCreate()]{@link domain.studies.Study.asyncCreate} when you need to create
     * a study within asynchronous code.
     */
    Participant.create = function (obj) {
      if (!tv4.validate(obj, schema)) {
        console.error('invalid object from server: ' + tv4.error);
        throw new DomainError('invalid object from server: ' + tv4.error);
      }

      if (!hasAnnotations.validAnnotations(obj.annotations)) {
        console.error('invalid object from server: bad annotation type');
        throw new DomainError('invalid object from server: bad annotation type');
      }
      return new Participant(obj);
    };

    Participant.get = function (studyId, id) {
      return biobankApi.get(sprintf.sprintf('/participants/%s/%s', studyId, id))
        .then(Participant.prototype.asyncCreate);
    };

    Participant.getByUniqueId = function (studyId, uniqueId) {
      return biobankApi.get(sprintf.sprintf('/participants/uniqueId/%s/%s', studyId, uniqueId))
        .then(function (reply) {
          return Participant.create(reply);
        });
    };

    Participant.prototype.setStudy = function (study) {
      this.study = study;
      this.studyId = study.id;
      this.setAnnotationTypes(study.annotationTypes);
    };

    Participant.prototype.asyncCreate = function (obj) {
      var deferred = $q.defer();

      obj = obj || {};
      obj.annotations = obj.annotations || {};

      if (!tv4.validate(obj, schema)) {
        console.error('invalid object from server: ' + tv4.error);
        deferred.reject('invalid object from server: ' + tv4.error);
      } else if (!hasAnnotations.validAnnotations(obj.annotations)) {
        console.error('invalid object from server: bad annotation type');
        deferred.reject('invalid object from server: bad annotation type');
      } else {
        deferred.resolve(new Participant(obj));
      }
      return deferred.promise;
    };

    /**
     * Returns a promise. If annotations are found to be invalid, then the promise is rejected. If the
     * annotations are valid, then a request is made to the server to add the participant.
     */
    Participant.prototype.add = function () {
      var self = this,
          deferred = $q.defer(),
          invalidAnnotationErrMsg = null,
          cmd = _.pick(self, 'studyId', 'uniqueId');

      // convert annotations to server side entities
      cmd.annotations = _.map(self.annotations, function (annotation) {
        // make sure required annotations have values
        if (!annotation.isValueValid()) {
          invalidAnnotationErrMsg = 'required annotation has no value: annotationId: ' +
            annotation.annotationTypeId;
        }
        return annotation.getServerAnnotation();
      });

      if (invalidAnnotationErrMsg) {
        deferred.reject(invalidAnnotationErrMsg);
      } else {
        biobankApi.post(uri(self.studyId), cmd)
          .then(self.asyncCreate)
          .then(function (participant) {
            deferred.resolve(participant);
          });
      }

      return deferred.promise;
    };

    /**
     * Sets the collection event type after an update.
     */
    Participant.prototype.update = function (path, reqJson) {
      var self = this;

      return ConcurrencySafeEntity.prototype.update.call(this, uri(path, self.id), reqJson)
        .then(postUpdate);

      function postUpdate(updatedParticipant) {
        if (self.study) {
          updatedParticipant.setStudy(self.study);
        }
        return $q.when(updatedParticipant);
      }
    };

    Participant.prototype.updateUniqueId = function (uniqueId) {
      return this.update('uniqueId', { uniqueId: uniqueId });
    };

    Participant.prototype.addAnnotation = function (annotation) {
      return this.update('annot', annotation.getServerAnnotation());
    };

    Participant.prototype.removeAnnotation = function (annotation) {
      var url = sprintf.sprintf('%s/%d/%s',
                                uri('annot', this.id),
                                this.version,
                                annotation.annotationTypeId);
      return hasAnnotations.removeAnnotation.call(this, annotation, url);
    };

    function uri(/* path, participantId */) {
      var path,
          participantId,
          result = '/participants',
          args = _.toArray(arguments);

      if (args.length > 0) {
        path = args.shift();
        result += '/' + path;
      }

      if (args.length > 0) {
        participantId = args.shift();
        result += '/' + participantId;
      }

      return result;
    }

    /** return constructor function */
    return Participant;
  }

  return ParticipantFactory;
});
