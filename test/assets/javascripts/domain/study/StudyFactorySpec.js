/**
 * Jasmine test suite
 *
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2016 Canadian BioSample Repository (CBSR)
 */
define([
  'angular',
  'angularMocks',
  'lodash'
], function(angular, mocks, _) {
  'use strict';

  fdescribe('StudyFactory', function() {

    // used by promise tests
    function failTest(error) {
      expect(error).toBeUndefined();
    }

    function uri(/* studyId */) {
      var args = _.toArray(arguments),
          studyId;

      var result = '/studies';

      if (args.length > 0) {
        studyId = args.shift();
        result += '/' + studyId;
      }

      return result;
    }
    beforeEach(mocks.module('biobankApp', 'biobank.test'));

    beforeEach(inject(function(entityTestSuite,
                               serverReplyMixin,
                               extendedDomainEntities) {
      var self = this;
      _.extend(self, entityTestSuite, serverReplyMixin);
      self.injectDependencies('$httpBackend',
                              'Study',
                              'StudyFactory',
                              'factory',
                              'testUtils');
    }));

    describe('when creating', function() {

      it('can create from with empty annotation types', function() {
        var jsonStudy = _.omit(this.factory.study(), 'annotationTypes'),
            study     = this.StudyFactory.create(jsonStudy);
        expect(study).toEqual(jasmine.any(this.Study));
      });

      it('fails when creating from an invalid object', function() {
        var self = this,
            badStudyJson = _.omit(self.factory.study(), 'name');

        expect(function () { self.StudyFactory.create(badStudyJson); })
          .toThrowError(/invalid object from server/);
      });

      it('fails when creating from a non object for an annotation type', function() {
        var self = this,
            badStudyJson = self.factory.study({ annotationTypes: [ 1 ]});
        expect(function () { self.StudyFactory.create(badStudyJson); })
          .toThrowError(/invalid object from server/);
      });

    });

    describe('when getting', function() {

      it('can retrieve a single study', function() {
        var self = this;
        self.$httpBackend.whenGET(uri(this.jsonStudy.id)).respond(this.reply(this.jsonStudy));
        self.StudyFactory.get(this.jsonStudy.id).then(self.expectStudy).catch(failTest);
        self.$httpBackend.flush();
      });

      it('fails when getting a study and it has a bad format', function() {
        var self = this,
            study = _.omit(self.jsonStudy, 'name');
        self.$httpBackend.whenGET(uri(study.id)).respond(this.reply(study));

        self.StudyFactory.get(study.id).then(shouldNotFail).catch(shouldFail);
        self.$httpBackend.flush();

        function shouldNotFail(reply) {
          fail('function should not be called');
        }

        function shouldFail(error) {
          expect(error).toStartWith('invalid object from server');
        }
      });

      it('fails when getting a study and it has a bad annotation type', function() {
        var self = this,
            annotationType = _.omit(self.factory.annotationType(), 'name'),
            study = self.factory.study({ annotationTypes: [ annotationType ]});

        self.$httpBackend.whenGET(uri(study.id)).respond(this.reply(study));

        self.StudyFactory.get(study.id).then(shouldNotFail).catch(shouldFail);
        self.$httpBackend.flush();

        function shouldNotFail(error) {
          fail('function should not be called: ' + error);
        }

        function shouldFail(error) {
          expect(error).toStartWith('invalid annotation types from server');
        }
      });

    });

  });

});
