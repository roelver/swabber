'use strict';

angular.module('swabberApp')
  .factory('BooksModal', function ($rootScope, $modal) {
    /**
     * Opens a modal
     * @param  {Object} scope      - an object to be merged with modal's scope
     * @param  {String} modalClass - (optional) class(es) to be applied to the modal
     * @return {Object}            - the instance $modal.open() returns
     */
    function openModal(scope, modalClass) {
      var modalScope = $rootScope.$new();
      scope = scope || {};
      modalClass = modalClass || 'modal-default';

      angular.extend(modalScope, scope);

      return $modal.open({
        templateUrl: 'components/modal/booksmodal.html',
        windowClass: modalClass,
        scope: modalScope
      });
    }

    // Public API here
    return {
      choice: function(callback) {
        callback = callback || angualar.noop;

        return function() {
            var args = Array.prototype.slice.call(arguments);
            var name = args.shift();
            var showModal;

            showModal = openModal({
              modal: {
                dismissable: true,
                title: 'Select your book',
                buttons: [{
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    showModal.dismiss(e);
                  }
                }],
                selectBook: function(book) {
                  showModal.close();
                  callback(book);
                }
              }
            }, 'modal-info');
          };
      }

    };
  })

  .factory('AbuseModal', function ($rootScope, $modal) {
    function openModal(scope, modalClass) {
      var modalScope = $rootScope.$new();
      scope = scope || {};
      modalClass = modalClass || 'modal-default';

      angular.extend(modalScope, scope);
      return $modal.open({
        templateUrl: 'components/modal/abusemodal.html',
        windowClass: modalClass,
        scope: modalScope
      });
    }

    // Public API here
    return {
      choice: function(book, callback) {
        callback = callback || angualar.noop;

        return function() {
            var args = Array.prototype.slice.call(arguments);
            var name = args.shift();
            var showModal;

            showModal = openModal({
              modal: {
                dismissable: true,
                title: 'Report Abuse',
                abusetext: '',
                submit: function() {
                    showModal.close();
                    callback(book, this.abusetext);
                }
              }
            }, 'modal-info');
          };
      }

    };
  })

  .factory('AddressModal', function ($rootScope, $modal) {
    /**
     * Opens a modal
     * @param  {Object} scope      - an object to be merged with modal's scope
     * @param  {String} modalClass - (optional) class(es) to be applied to the modal
     * @return {Object}            - the instance $modal.open() returns
     */
    function openModal(scope, modalClass) {
      var modalScope = $rootScope.$new();
      scope = scope || {};
      modalClass = modalClass || 'modal-default';

      angular.extend(modalScope, scope);
      return $modal.open({
        templateUrl: 'components/modal/addressmodal.html',
        windowClass: modalClass,
        scope: modalScope
      });
    }

    // Public API here
    return {
      choice: function(book, callback) {
        callback = callback || angualar.noop;

        return function() {
            var args = Array.prototype.slice.call(arguments);
            console.log('Args:',args);
            var name = args.shift();
            var showModal;

            showModal = openModal({
              modal: {
                dismissable: true,
                title: 'Enter delivery address',
                text: 'Where will this book '+book.title+' be sent to.',
                address: '',
                postalcode: '',
                city: '',
                submit: function() {
                    showModal.close();
                    callback(book, this.address, this.postalcode, this.city);
                }
              }
            }, 'modal-info');
          };
      }
    };
  })
;
