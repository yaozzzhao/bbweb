// Jasmine test suite
//
define(['angular', 'angularMocks', 'underscore', 'biobankApp'], function(angular, mocks, _) {
  'use strict';

  describe('Controller: ParticipantAnnotTypesPanelCtrl', function() {
    var scope, state, modalService, participantAnnotTypesService;
    var annotationTypeRemoveService, annotTypeModalService, panelService;
    var panelFns;
    var study = {id: 'study-id', name: 'ST1', status: 'Disabled'};
    var annotTypes = [
      {id: 'dummy-annot-type-id-1', name: 'PAT1', valueType: 'DateTime'},
      {id: 'dummy-annot-type-id-2', name: 'PAT2', valueType: 'Name'},
    ];
    var annotTypesInUse = ['dummy-annot-type-id-1'];

    beforeEach(mocks.module('biobankApp'));

    beforeEach(inject(function(_modalService_,
                               _participantAnnotTypesService_,
                               _annotationTypeRemoveService_,
                               _annotTypeModalService_,
                               _panelService_) {
      state = jasmine.createSpyObj('state', ['go']);

      modalService =                 _modalService_;
      participantAnnotTypesService =      _participantAnnotTypesService_;
      annotationTypeRemoveService =  _annotationTypeRemoveService_;
      annotTypeModalService =        _annotTypeModalService_;
      panelService =                 _panelService_;

      panelFns = jasmine.createSpyObj('panelFns', [
        'information',
        'add',
        'panelToggle',
        'getTableParams'
      ]);

      spyOn(panelService, 'panel').and.callFake(function () {
        return {
          information: panelFns.information,
          add: panelFns.add,
          panelOpen: true,
          panelToggle: panelFns.panelToggle,
          getTableParams: panelFns.getTableParams
        };
      });

    }));

    beforeEach(inject(function($controller, $rootScope, $filter) {
      scope = $rootScope.$new();
      scope.study = study;
      scope.annotTypes = annotTypes;
      scope.annotTypesInUse = annotTypesInUse;

      $controller('ParticipantAnnotTypesPanelCtrl as vm', {
        $scope:                      scope,
        $state:                      state,
        modalService:                modalService,
        participantAnnotTypesService:     participantAnnotTypesService,
        annotationTypeRemoveService: annotationTypeRemoveService,
        annotTypeModalService:       annotTypeModalService,
        panelService:                panelService
      });
      scope.$digest();
    }));

    it('has valid scope', function() {
      expect(scope.vm.annotTypes).toBe(annotTypes);
      // Uncomment line below once 'participant annotation types in use' API is enabled.
      //expect(scope.vm.annotTypesInUse).toBe(annotTypesInUse);
      expect(scope.vm.columns).toBeArrayOfSize(4);
      expect(scope.vm.columns[0].title).toBe('Name');
      expect(scope.vm.columns[1].title).toBe('Type');
      expect(scope.vm.columns[2].title).toBe('Required');
      expect(scope.vm.columns[3].title).toBe('Description');
      expect(scope.vm.tableParams).not.toBeNull();
    });

    /**
     * Enable this test once 'participant annotation types in use' API is enabled.
     */
    xit('on update should open a modal to display annotation type in use modal', function() {
      spyOn(modalService, 'modalOk');
      scope.vm.update(annotTypes[0]);
      expect(modalService.modalOk).toHaveBeenCalled();
    });

    it('on update should change state to update an annotation type', function() {
      spyOn(modalService, 'modalOk');
      scope.vm.update(annotTypes[1]);
      expect(state.go).toHaveBeenCalledWith(
        'home.admin.studies.study.participants.annotTypeUpdate',
        { annotTypeId: annotTypes[1].id });
    });

    /**
     * Enable this test once 'participant annotation types in use' API is enabled.
     */
    xit('on remove opens a modal to display annotation type in use modal', function() {
      spyOn(modalService, 'modalOk');
      scope.vm.remove(annotTypes[0]);
      expect(modalService.modalOk).toHaveBeenCalled();
    });

    it('on update should change state to update an annotation type', function() {
      spyOn(annotationTypeRemoveService, 'remove');
      scope.vm.remove(annotTypes[1]);
      expect(annotationTypeRemoveService.remove).toHaveBeenCalled();
    });

    describe('for the panel service', function() {

      it('should invoke information function', function() {
        scope.vm.information();
        expect(panelFns.information).toHaveBeenCalled();
      });

      it('should invoke add function', function() {
        scope.vm.add();
        expect(panelFns.add).toHaveBeenCalled();
      });

      it('should invoke panelToggle function', function() {
        scope.vm.panelToggle();
        expect(panelFns.panelToggle).toHaveBeenCalled();
      });

      it('should invoke getTableParams function', function() {
        expect(panelFns.getTableParams).toHaveBeenCalled();
      });

      it('should return the panels open state', function() {
        var panelState = scope.vm.panelOpen;
        expect(panelState).toEqual(true);
      });

    });


  });

});
