/**
 * Jasmine test suite
 */
define([
  'angular',
  'angularMocks',
  '../enumSharedSpec',
  'biobank.testUtils',
  'biobankApp'
], function(angular, mocks, enumSharedSpec, testUtils) {
  'use strict';

  describe('CentreStatus', function() {

    var context = {},
        statuses = ['Disabled', 'Enabled'];

    beforeEach(mocks.module('biobankApp', 'biobank.test'));

    beforeEach(inject(function (CentreStatus) {
      context.enumerationClass = CentreStatus;
      context.valueMap = _.map(statuses, function (value) {
        return [ value, testUtils.camelCaseToUnderscore(value)];
      });
    }));

    enumSharedSpec(context);
  });

});