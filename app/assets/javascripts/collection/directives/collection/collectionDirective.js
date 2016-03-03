/**
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2015 Canadian BioSample Repository (CBSR)
 */
define(function () {
  'use strict';

  /**
   * Description
   */
  function collectionDirective() {
    var directive = {
      restrict: 'E',
      scope: {},
      bindToController: {
        studyCounts: '='
      },
      templateUrl : '/assets/javascripts/collection/directives/collection/collection.html',
      controller: CollectionCtrl,
      controllerAs: 'vm'
    };
    return directive;
  }

  CollectionCtrl.$inject = ['Study'];

  /**
   *
   */
  function CollectionCtrl(Study) {
    var vm = this;

    vm.haveEnabledStudies = (vm.studyCounts.enabledCount > 0);
    vm.updateEnabledStudies = updateEnabledStudies;
    vm.getEnabledStudiesPanelHeader = getEnabledStudiesPanelHeader;

    //---

    function updateEnabledStudies(options) {
      return Study.list(options);
    }

    function getEnabledStudiesPanelHeader() {
      return 'Studies you participate in';
    }

  }

  return collectionDirective;
});