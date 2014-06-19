/**
 * User controllers.
 */
define(['angular', 'common'], function(angular, common) {
  'use strict';

  /**
   * user is not a service, but stems from userResolve (Check ../user/services.js) object.
   */
  var StudiesCtrl = function($scope, $rootScope, $filter, $location, $log, ngTableParams, user, studyService) {
    $rootScope.pageTitle = 'Biobank studies';
    $scope.studies = [];
    $scope.user = user;
    studyService.list().then(function(response) {
      $scope.studies = response.data;
    });

    $scope.addStudy = function() {
      $location.path("/studies/edit");
    };

    $scope.studyInformation = function(annotType) {
      $location.path("/studies/" + annotType.id);
    };

    $scope.tableView = function() {
      $location.path("/studies/table");
    };
  };

  var StudiesTableCtrl = function($scope, $rootScope, $filter, $location, $log, ngTableParams, user, studyService) {
    $rootScope.pageTitle = 'Biobank studies';
    $scope.studies = [];

    studyService.list().then(function(response) {
      $scope.studies = response.data;

      /* jshint ignore:start */
      $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10,          // count per page
        sorting: {
          name: 'asc'       // initial sorting
        }
      }, {
        counts: [], // hide page counts control
        total: $scope.studies.length,
        getData: function($defer, params) {
          var orderedData = params.sorting()
            ? $filter('orderBy')($scope.studies, params.orderBy())
            : $scope.studies;
          $defer.resolve(orderedData.slice(
            (params.page() - 1) * params.count(),
            params.page() * params.count()));
        }
      });
      /* jshint ignore:end */
    });

    $scope.addStudy = function() {
      $location.path("/studies/edit");
    };

    $scope.studyInformation = function(annotType) {
      $location.path("/studies/" + annotType.id);
    };

    $scope.defaultView = function() {
      $location.path("/studies");
    };

  };

  /**
   * See http://stackoverflow.com/questions/22881782/angularjs-tabset-does-not-show-the-correct-state-when-the-page-is-reloaded
   */
  var StudyCtrl = function($scope, $rootScope, $routeParams, $location, $log, $filter, user, studyService) {
    $rootScope.pageTitle = 'Biobank study';
    $scope.user = user;
    $scope.study = {};
    $scope.description = "";
    $scope.descriptionToggle = true;

    studyService.query($routeParams.id)
      .success(function(data) {
        $scope.study = data;
        $scope.description = $scope.study.description;
      })
      .error(function() {
        $location.path("/studies/error");
      });

    $scope.updateStudy = function(study) {
      $log.info("updateStudy");
      if (study.id === undefined) {
        throw new Error("study does not have an ID");
      }
      $location.path("/studies/edit/" + study.id);
    };

    $scope.changeStatus = function(study) {
      if (study.id === undefined) {
        throw new Error("study does not have an ID");
      }
      alert("change status of " + study.name);
    };

    $scope.truncateDescriptionToggle = function() {
      if ($scope.descriptionToggle) {
        $scope.description = $filter('truncate')($scope.study.description, 100);
      } else {
        $scope.description = $scope.study.description;
      }
      $scope.descriptionToggle = !$scope.descriptionToggle;
    };
  };

  /** Called to add or update a study.
   */
  var StudyEditCtrl = function(
    $scope,
    $rootScope,
    $route,
    $routeParams,
    $location,
    $modal,
    $log,
    user,
    studyService) {

    var id = $routeParams.id;

    $rootScope.pageTitle = 'Biobank study';
    if (id === undefined) {
      $scope.title =  "Add new study";
      $scope.study = {
        name: "",
        description: null
      };
    } else {
      $scope.title =  "Update study";
      studyService.query(id).then(function(response) {
        $scope.study = response.data;
      });
    }

    $scope.submit = function(study) {
      var modalInstance = {};

      studyService.addOrUpdate(study)
        .success(function() {
          $location.path('/studies/' + $scope.study.id);
        })
        .error(function(error) {
          if (error.message.indexOf("expected version doesn't match current version") > -1) {
            /* concurrent change error */
            modalInstance = $modal.open({
              templateUrl: '/assets/javascripts/common/errorModal.html',
              controller: 'errorModal',
              resolve: {
                title: function () {
                  return "Modified by another user";
                },
                message: function() {
                  return "Another user already made changes to this study. Press OK to make " +
                    " your changes again, or Cancel to dismiss your changes.";
                }
              }
            });

            modalInstance.result.then(function(selectedItem) {
              $route.reload();
            }, function () {
              $location.path('/studies/' + $scope.study.id);
            });
          } else {
            /* some other error */
            modalInstance = $modal.open({
              templateUrl: '/assets/javascripts/common/errorModal.html',
              controller: 'errorModal',
              resolve: {
                title: function () {
                  return (study.id === undefined) ? "Cannot add study" : "Cannot update study";
                },
                message: function() {
                  return "Error: " + error.message;
                }
              }
            });

            modalInstance.result.then(function(selectedItem) {
              $route.reload();
            }, function () {
              $route.reload();
            });
          }
        });
    };

    $scope.cancel = function(study) {
      if ($scope.study.id === undefined) {
        $location.path('/studies');
      } else {
        $location.path('/studies/' + $scope.study.id);
      }
    };
  };

  /**
   * Displays study annotation type summary information in a table. The user can then select a row
   * to display more informaiton for te annotation type.
   */
  var AnnotationTypeDirectiveCtrl = function(
    $scope,
    $element,
    $routeParams,
    $modal,
    $location,
    $filter,
    $log,
    ngTableParams,
    studyService) {

    $scope.annotationTypes = [];
    $scope.tableParams = {};
    var studyId = $routeParams.id;

    $scope.annotInformation = function(annotType) {
      $log.debug(annotType);

      $modal.open({
        templateUrl: '/assets/javascripts/study/annotationType.html',
        controller: AnnotationTypeCtrl,
        resolve: {
          annotType: function () {
            return annotType;
          }
        }
      });
    };

    studyService.participantInfo(studyId)
      .success(function(data) {
        $scope.annotationTypes = data;

        /* jshint ignore:start */
        $scope.tableParams = new ngTableParams({
          page: 1,            // show first page
          count: 10,          // count per page
          sorting: {
            name: 'asc'       // initial sorting
          }
        }, {
          counts: [], // hide page counts control
          total: $scope.annotationTypes.length,
          getData: function($defer, params) {
            var orderedData = params.sorting()
              ? $filter('orderBy')($scope.annotationTypes, params.orderBy())
              : $scope.annotationTypes;
            $defer.resolve(orderedData.slice(
              (params.page() - 1) * params.count(),
              params.page() * params.count()));
          }
        });
        /* jshint ignore:end */
      })
      .error(function(err) {
        throw new Error("invalid response for study participant annotation types: ", err);
      });

    $scope.annotInformation = function(annotType) {
      $log.debug(annotType);

      $modal.open({
        templateUrl: '/assets/javascripts/study/annotationType.html',
        controller: AnnotationTypeCtrl,
        resolve: {
          annotType: function () {
            return annotType;
          }
        }
      });
    };

    $scope.updateAnnotationType = function(annotType) {
      $log.info("editAnnotationType");
      $location.path("/studies/partannot/edit/" + annotType.id);
    };

    $scope.removeAnnotationType = function(annotType) {
      $log.info("removeAnnotationType");
      $location.path("/studies/partannot/remove/" + annotType.id);
    };
  };

  /**
   * This controller displays a study annotation type in a modal. The information is displayed
   * in a table.
   */
  var AnnotationTypeCtrl = function ($scope, $modalInstance, ngTableParams, annotType) {
    $scope.annotType = annotType;
    $scope.data = [];

    $scope.data.push({name: 'Name:',     value: annotType.name});
    $scope.data.push({name: 'Type:',     value: annotType.valueType});

    if (annotType.required !== undefined) {
      $scope.data.push({name: 'Required:', value: annotType.required ? "Yes" : "No"});
    }

    if (annotType.valueType === 'Select') {
      var optionValues = [];
      for (var name in annotType.options) {
        optionValues.push(annotType.options[name]);
      }

      $scope.data.push({
        name: '# Selections Allowed:',
        value: annotType.maxValueCount === 1 ? "Single" : "Multiple"});
      $scope.data.push({
        name: 'Selections:',
        value: optionValues.join(",")});
    }

    $scope.data.push({name: 'Description:', value: annotType.description});

    /* jshint ignore:start */
    $scope.tableParams = new ngTableParams({
      page:1,
      count: 10
    }, {
      counts: [], // hide page counts control
      total: $scope.data.length,           // length of data
      getData: function($defer, params) {
        $defer.resolve($scope.data);
      }
    });
    /* jshint ignore:end */
  };

  var StudyAnnotationTypeEditCtrl = function ($scope, $log, $routeParams) {
    $log.info("StudyAnnotationTypeEditCtrl:", $routeParams);
  };

  var StudyAnnotationTypeRemoveCtrl = function ($scope, $log, $routeParams) {
    $log.info("StudyAnnotationTypeRemoveCtrl:", $routeParams);
  };

  return {
    StudiesCtrl: StudiesCtrl,
    StudiesTableCtrl: StudiesTableCtrl,
    StudyCtrl: StudyCtrl,
    StudyEditCtrl: StudyEditCtrl,
    AnnotationTypeDirectiveCtrl: AnnotationTypeDirectiveCtrl,
    AnnotationTypeCtrl: AnnotationTypeCtrl,
    StudyAnnotationTypeEditCtrl: StudyAnnotationTypeEditCtrl,
    StudyAnnotationTypeRemoveCtrl: StudyAnnotationTypeRemoveCtrl
  };

});
