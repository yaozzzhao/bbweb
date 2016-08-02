/**
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2015 Canadian BioSample Repository (CBSR)
 */
define(['angular', 'lodash', 'sprintf', 'tv4'], function(angular, _, sprintf, tv4) {
  'use strict';

  StudyFactoryFactory.$inject = [
    '$q',
    'DomainEntityFactory',
    'Study',
    'DomainError',
    'biobankApi'
  ];

  /**
   * Angular factory for creating Studies.
   */
  function StudyFactoryFactory($q,
                               DomainEntityFactory,
                               Study,
                               DomainError,
                               biobankApi) {

    /**
     * @class
     * @memberOf domain.studies.StudyFactory
     * @extends domain.DomainEntityFactory
     *
     * @classdesc A factory that creates {@link domain.studies.Study|Study} domain entities.
     */
    function StudyFactory() {
    }

    StudyFactory.prototype = Object.create(DomainEntityFactory.prototype);
    StudyFactory.prototype.constructor = StudyFactory;

    StudyFactory.prototype.create = function (obj) {
      var validation = Study.validate(obj);
      if (!validation.valid) {
        console.error(validation.message);
        throw new DomainError(validation.message);
      }

      return new Study(obj);
    };

    StudyFactory.prototype.asyncCreate = function (obj) {
      var validation = Study.validate(obj),
          deferred = $q.defer();

      if (!validation.valid) {
        console.error('invalid object from server: ' + tv4.error);
        deferred.reject('invalid object from server: ' + tv4.error);
      } else {
        deferred.resolve(new Study(obj));
      }

      return deferred.promise;
    };

    StudyFactory.prototype.get = function (id) {
      return biobankApi.get('/studies/' + id).then(function(reply) {
        return this.asyncCreate(reply);
      });
    };

    /**
     * A paged API is used to list studies. See below for more details.
     *
     * @param {object} options - The options to use to list studies.
     *
     * @param {string} [options.filter] The filter to use on study names.
     *
     * @param {string} [options.status=all] Returns studies filtered by status. The following are valid:
     * <code>all</code> to return all studies, <code>disabled</code> to only return disabled studies,
     * <code>enabled</code> to only return enabled studies, and <code>retired</code> to only return retired
     * studies. For any other values the response is an error.
     *
     * @param {string} [options.sortField=name] Studies can be sorted by <code>name</code> or by
     * <code>status</code>. Values other than these two yield an error.
     *
     * @param {int} [options.page=1] If the total results are longer than pageSize, then page selects which
     * studies should be returned. If an invalid value is used then the response is an error.
     *
     * @param {int} [options.pageSize=10] The total number of studies to return per page. The maximum page
     * size is 10. If a value larger than 10 is used then the response is an error.
     *
     * @param {string} [options.order=asc] - The order to list studies by. One of: <code>asc</code> for
     * ascending order, or <code>desc</code> for descending order.
     *
     * @return {Promise<domain.PagedResult>} If the promise succeeds then a paged result is returned.
     */
    StudyFactory.prototype.list = function (options) {
      var url = '/studies',
          params,
          validKeys = [
            'filter',
            'status',
            'sort',
            'page',
            'pageSize',
            'order'
          ];

      options = options || {};
      params = _.extend({}, _.pick(options, validKeys));

      return biobankApi.get(url, params).then(function(reply) {
        // reply is a paged result
        var deferred = $q.defer();
        try {
          reply.items = _.map(reply.items, function(obj){
            return this.create(obj);
          });
          deferred.resolve(reply);
        } catch (e) {
          deferred.reject('invalid studies from server');
        }
        return deferred.promise;
      });
    };


    return StudyFactory;
  }

  return StudyFactoryFactory;
});
