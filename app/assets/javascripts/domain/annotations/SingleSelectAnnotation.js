/**
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2015 Canadian BioSample Repository (CBSR)
 */
define(['lodash'], function(_) {
  'use strict';

  SingleSelectAnnotationFactory.$inject = ['Annotation', 'DomainError'];

  function SingleSelectAnnotationFactory(Annotation, DomainError) {

    /**
     * Please use annotationFactory.create to create annotation objects.
     */
    function SingleSelectAnnotation(obj, annotationType) {
      var self = this;

      obj = obj || {};
      Annotation.call(this, obj, annotationType);

      self.valueType = 'SingleSelect';

      if (!_.isUndefined(obj.selectedValues)) {
        if (obj.selectedValues.length === 0) {
          self.value = null;
        } else if (obj.selectedValues.length === 1) {
          self.value = obj.selectedValues[0];
        } else {
          throw new DomainError('invalid value for selected values');
        }
      }
    }

    SingleSelectAnnotation.prototype = Object.create(Annotation.prototype);

    SingleSelectAnnotation.prototype.getValue = function () {
      return this.value;
    };

    SingleSelectAnnotation.prototype.getServerAnnotation = function () {
      var self = this,
          selectedValues = [];

      if (this.value) {
        selectedValues.push(self.value);
      }

      return {
        annotationTypeId: this.getAnnotationTypeId(),
        selectedValues:   selectedValues
      };
    };

    return SingleSelectAnnotation;
  }

  return SingleSelectAnnotationFactory;
});
