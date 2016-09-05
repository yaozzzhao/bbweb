/**
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2016 Canadian BioSample Repository (CBSR)
 */
define(['lodash'], function (_) {
  'use strict';

  var component = {
    templateUrl : '/assets/javascripts/centres/components/shipmentAdd/shipmentAdd.html',
    controller: ShipmentAddController,
    controllerAs: 'vm',
    bindings: {}
  };

  ShipmentAddController.$inject = [
    '$state',
    'gettextCatalog',
    'Centre',
    'Shipment',
    'domainNotificationService',
    'notificationsService',
    'shipmentSendProgressItems'
  ];

  /**
   *
   */
  function ShipmentAddController($state,
                                 gettextCatalog,
                                 Centre,
                                 Shipment,
                                 domainNotificationService,
                                 notificationsService,
                                 shipmentSendProgressItems) {
    var vm = this;

    vm.progressInfo = {
      items: shipmentSendProgressItems,
      current: 1
    };

    vm.hasValidCentres          = false;
    vm.shipment                 = new Shipment();
    vm.selectedFromLocationInfo = undefined;
    vm.selectedToLocationInfo   = undefined;

    vm.$onInit               = onInit;
    vm.submit                = submit;
    vm.cancel                = cancel;
    vm.getCentreLocationInfo = getCentreLocationInfo;

    //--

    function onInit() {
      return Centre.locationsSearch('').then(function (results) {
        vm.hasValidCentres = (results.length > 1);
      });
    }

    function submit(specimenSpec) {
      vm.shipment.fromLocationInfo = { locationId: vm.selectedFromLocationInfo.locationId };
      vm.shipment.toLocationInfo = { locationId: vm.selectedToLocationInfo.locationId };
      vm.shipment.add().then(onAddSuccessful).catch(onAddFailed);

      function onAddSuccessful(shipment) {
        $state.go('home.shipping.addItems', { shipmentId: shipment.id });
      }

      function onAddFailed(error) {
        domainNotificationService.updateErrorModal(error, gettextCatalog.getString('shipment'));
      }
    }

    function cancel() {
      $state.go('home.shipping');
    }

    function getCentreLocationInfo(filter) {
      return Centre.locationsSearch(filter);
    }

  }

  return component;
});
