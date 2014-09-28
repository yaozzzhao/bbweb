/** Common helpers */
define(['angular', 'common'], function(angular) {
  'use strict';

  var mod = angular.module('admin.studies.participants.helpers', ['biobank.common']);

  mod.service('participantAnnotTypeEditService', [
    '$state', '$stateParams', 'modalService', 'studyAnnotTypeEditService', 'ParticipantAnnotTypeService',
    function($state, $stateParams, modalService, studyAnnotTypeEditService, ParticipantAnnotTypeService) {
      return {
        edit: function ($scope) {

          var onSubmit = function (annotType) {
            ParticipantAnnotTypeService.addOrUpdate(annotType).then(
              function() {
                $state.transitionTo(
                  'admin.studies.study.participants',
                  $stateParams,
                  { reload: true, inherit: false, notify: true });
              },
              function(message) {
                studyAnnotTypeEditService.onError($scope, message, 'admin.studies.study.participants');
              });
          };

          var onCancel = function () {
            $state.go('admin.studies.study.participants');
          };

          studyAnnotTypeEditService.edit($scope, onSubmit, onCancel);
        }
      };
    }
  ]);

  /**
   * Removes a participant annotation type.
   */
  mod.service('participantAnnotTypeRemoveService', [
    '$state', 'stateHelper', 'studyRemoveModalService', 'ParticipantAnnotTypeService',
    function ($state, stateHelper, studyRemoveModalService, ParticipantAnnotTypeService) {
      return {
        remove: function(annotType) {
          studyRemoveModalService.remove(
            'Remove Participant Annotation Type',
            'Are you sure you want to remove annotation type ' + annotType.name + '?',
            function () {
              ParticipantAnnotTypeService.remove(annotType).then(
                function() {
                  stateHelper.reloadAndReinit();
                },
                function(error) {
                  var bodyText = 'Annotation type ' + annotType.name + ' cannot be removed: ' + error.message;
                  studyRemoveModalService.orError(
                    bodyText,
                    'admin.studies.study.participants',
                    'admin.studies.study.participants');
                });
            },
            function() {
              $state.go('admin.studies.study.participants');
            });
        }
      };
    }
  ]);

  return mod;
});
