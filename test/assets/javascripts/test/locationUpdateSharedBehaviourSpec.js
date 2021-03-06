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

  /**
   * Used for directives that update locations on a domain entity.
   */
  function locationUpdateSharedBehaviour(context) {

    describe('(shared)', function() {

      beforeEach(inject(function() {
        this.injectDependencies('$q', 'modalInput', 'notificationsService');
      }));

      it('on update should invoke the update method on entity', function() {
        var modalInputDeferred = this.$q.defer();

        modalInputDeferred.resolve(context.newValue);

        spyOn(this.modalInput, context.modalInputFuncName)
          .and.returnValue({ result: modalInputDeferred.promise});
        spyOn(context.entity.prototype, context.entityUpdateFuncName)
          .and.returnValue(this.$q.when(context.entity));
        spyOn(this.notificationsService, 'success').and.returnValue(this.$q.when('OK'));

        context.createController.call(this);
        this.controller[context.controllerUpdateFuncName](context.locationt);
        this.scope.$digest();

        expect(context.entity.prototype[context.entityUpdateFuncName]).toHaveBeenCalled();
        expect(this.notificationsService.success).toHaveBeenCalled();
      });

      it('error message should be displayed when update fails', function() {
        var modalDeferred = this.$q.defer(),
            updateDeferred = this.$q.defer();

        modalDeferred.resolve(context.newValue);
        updateDeferred.reject('simulated error');

        spyOn(this.modalInput, context.modalInputFuncName)
          .and.returnValue({ result: modalDeferred.promise});
        spyOn(context.entity.prototype, context.entityUpdateFuncName)
          .and.returnValue(updateDeferred.promise);
        spyOn(this.notificationsService, 'updateError').and.returnValue(this.$q.when('OK'));

        context.createController.call(this);
        this.controller[context.controllerUpdateFuncName](context.annotation);
        this.scope.$digest();

        expect(this.notificationsService.updateError).toHaveBeenCalled();
      });

    });

  }

  return locationUpdateSharedBehaviour;
});
