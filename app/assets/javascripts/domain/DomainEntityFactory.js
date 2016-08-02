/**
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2016 Canadian BioSample Repository (CBSR)
 */
define(function () {
  'use strict';

  //DomainEntityFactoryFactory.$inject = [];

  function DomainEntityFactoryFactory() {

    /**
     * @classdesc Base class for factories that create domain entities.
     *
     * @class
     * @memberOf domain
     */
    function DomainEntityFactory() {

    }

    /**
     * Creates a domain entity, but first it validates <code>obj</code> to ensure that it has a valid schema.
     *
     * @param {object} [obj={}] - An initialization object whose properties are the same as the members for
     * this domain entity. Objects of this type are usually returned by the server's REST API.
     *
     * @abstract
     * @returns {domain.ConcurrencySafeEntity} A new object.
     *
     * @see {@link domain.DomainEntityFactory#asyncCreate|asyncCreate()} when you need to create
     * an object within asynchronous code.
     *
     */
    DomainEntityFactory.prototype.create = function (obj) {
      throw new Error('must be implemented by subclass!');
    };

    /**
     * Creates a domain entity from a server reply but first validates that it has a valid schema.
     *
     * <p>Meant to be called from within promise code.</p>
     *
     * @param {object} [obj={}] - An initialization object whose properties are the same as the members from
     * this class. Objects of this type are usually returned by the server's REST API.
     *
     * @abstract
     * @returns {Promise<domain.ConcurrencySafeEntity>} A new object wrapped in a promise.
     *
     * @see {@link domain.DomainEntityFactory#create|create()} when not creating a domain entity within
     * asynchronous code.
     */
    DomainEntityFactory.prototype.asyncCreate = function (obj) {
      throw new Error('must be implemented by subclass!');
    };

    /**
     * Retrieves a domain entity from the server.
     *
     * @abstract
     *
     * @param {string} id the ID of the domain entity to retrieve.
     *
     * @returns {Promise<domain.ConcurrencySafeEntity>} A new object wrapped in a promise.
     */
    DomainEntityFactory.prototype.get = function (id) {
      throw new Error('must be implemented by subclass!');
    };

    /**
     * @typedef domain.PagedResult
     *
     * @type object
     *
     * @property {Array<domain.ConcurrencySafeEntity>} id - the items in the result set.
     *
     * @property {int} page - The page these results correspond to.
     *
     * @property {int} pageSize - The number of items in this result set.
     *
     * @property {int} offset - The page offset. Starts at 0.
     *
     * @param {int} total - the total elements in all pages.
     */

    /**
     * Creates domain entities by using the servers list API for the given domain entity.
     *
     * @abstract
     *
     * @param {object} options - The options to use when listing.
     *
     * @return {Promise<domain.PagedResult>} If the promise succeeds then a paged result,
     * containing the entities, is returned.
     */
    DomainEntityFactory.prototype.list = function (options) {
      throw new Error('must be implemented by subclass!');
    };


    return DomainEntityFactory;
  }

  return DomainEntityFactoryFactory;
});
