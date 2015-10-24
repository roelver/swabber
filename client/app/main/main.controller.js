'use strict';

angular.module('swabberApp')
  .controller('MainCtrl', function ($scope, $http, BooksModal, AbuseModal, AddressModal, $rootScope, Auth) {

    $scope.freeBooks = [];
    $scope.myBooks = [];
    $scope.notifications = [];

    $scope.myLendedOut = []; // My books lended to someoune else
    $scope.myLendedIn = []; // Books lended to someoune else
    $scope.myRequestedOut = [];
    $scope.myRequestedIn = [];

    $scope.keywords = '';
    $scope.showOwnBooks = true;
    $scope.displayOwner = -1;
    $scope.displayRequestedOutOwner = -1;
    $scope.displayRequestedInRequestor = -1;
    $scope.displayLendedOutLender = -1;
    $scope.displayLendedInOwner = -1;

    $scope.defaultCover = 'https://books.google.nl/googlebooks/images/no_cover_thumb.gif';

    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.me = Auth.getCurrentUser();

    $http.get('/api/books/free').success(function(freeBooks) {
      $scope.freeBooks = freeBooks;
    });

    $scope.getMyBooks = function() {
      $http.get('/api/books/owner/'+$scope.me._id).success(function(myBooks) {
        $scope.myBooks = myBooks;
      });
    };

    $scope.isAdmin = function() {
      return $scope.me.name === 'Admin';
    };

    $scope.getLendedOut = function() {
      $http.get('/api/books/lendedOut/'+$scope.me._id).success(function(myBooks) {
        $scope.myLendedOut = myBooks;
      });
    };

    $scope.getLendedIn = function() {
      $http.get('/api/books/lendedIn/'+$scope.me._id).success(function(myBooks) {
        $scope.myLendedIn = myBooks;
      });
    };

    $scope.getRequestedOut = function() {
      $http.get('/api/books/requestedOut/'+$scope.me._id).success(function(myBooks) {
        $scope.myRequestedOut = myBooks;
      });
    };

    $scope.getRequestedIn = function() {
      $http.get('/api/books/requestedIn/'+$scope.me._id).success(function(myBooks) {
        $scope.myRequestedIn = myBooks;
      });
    };

    $scope.getMyNotifications = function() {
      $http.get('/api/notifications/foruser/'+$scope.me.name).success(function(notifs) {
         $scope.notifications = notifs;
      });
    };

    $scope.addBook = function() {
      if($scope.newBook === '') {
        return;
      }
      $http.post('/api/books', $scope.newBook);
      $scope.freeBooks.push($scope.newBook );
      $scope.myBooks.push($scope.newBook );
      $scope.newBook = '';
    };

    $scope.deleteBook = function(book) {
      $http.delete('/api/books/' + book._id);
    };

    $scope.updateBook = function(book) {
      $http.put('/api/books/' + book._id, book);
    };

    $scope.searchBook = function() {
      $http.get('/api/books/search/'+$scope.keywords)
        .then(function(books) {
            if (books.data.error !== undefined) {
              alert('Error: '+books.data.error.message);
              return;
            }
            if (books.data.items.length > 1) {
              books.data.items.forEach(function(bookItem) {
                  if (!bookItem.volumeInfo.imageLinks) {
                      bookItem.volumeInfo.imageLinks = {};
                  } 
                  if (!bookItem.volumeInfo.imageLinks.thumbnail) {
                      bookItem.volumeInfo.imageLinks.thumbnail = $scope.defaultCover; 
                  }
              });
              $rootScope.booklist = books.data.items;
              var mod = BooksModal.choice( $scope.selectBook);
              mod();
            }
            else {
              $scope.selectBook(books.data.items[0]);
            }
         }, function(err) {
           console.log('Error:', err);          
         });
    };

    $scope.selectBook = function (book) {
      $scope.newBook = {
        owner: $scope.me,
        coverImg: book.volumeInfo.imageLinks.thumbnail,
        title:  book.volumeInfo.title,
        lended: false
      };
      $scope.addBook();
    };

    $scope.deleteNotification = function(notification) {
      $http.delete('/api/notifications/' + notification._id);
      $rootScope._.remove($scope.notifications, {
          _id: notification._id
      });
    };

    // Context menu handlers
 
    $scope.requestBook = function(idx) {
      var mod = AddressModal.choice($scope.freeBooks[idx], $scope.requestBook2);
      mod();
    };
    $scope.requestBook2= function(book, address, postalCode, city) {
        book.requestedBy = 
           { _id: $scope.me._id,
             name: $scope.me.name,
             email: $scope.me.email
           };
        book.address = address;
        book.postalCode = postalCode;
        book.city = city;
        $scope.updateBook(book);
        $rootScope._.remove($scope.freeBooks, {
          _id: book._id
        });
        $scope.myRequestedOut.push(book);
        $scope.createNotification(
          book.owner.name,
          "Please accept my book request for '"+book.title+ "'. I can't wait to start reading. My address is:\n" +
          $scope.me.name+"\n"+book.address+"\n"+book.postalCode+" "+book.city);
    };

    $scope.deleteMyBook = function(idx) {
      $scope.deleteBook($scope.myBooks[idx]);
      $rootScope._.remove($scope.freeBooks, {
          _id: $scope.myBooks[idx]._id
        });
      $scope.myBooks.splice(idx,1);
    };

    $scope.giveAway = function(idx) {
      if (confirm('Are you sure you want to give this beautiful book away?')) {
          var book = $scope.myLendedOut[idx];
          var newOwner = angular.copy(book.lendedTo);
          book.owner = newOwner;
          book.lendedTo = null;
          book.address = null;
          book.postalCode = null;
          book.city = null;
          book.lended = false;
          $scope.updateBook(book);
          $scope.myLendedOut.splice(idx,1);
          $scope.freeBooks.push(book);
          $scope.createNotification(
            book.owner.name,
            $scope.me.name+ " is giving book '"+book.title+ "' to you. Isn't that nice?");
      }
    };

    $scope.requestReturn = function(idx) {
      $scope.createNotification(
        $scope.myLendedOut[idx].lendedTo.name,
        "Can you please return my book "+$scope.myLendedOut[idx].title+" as soon as possible?");
    };

    $scope.reportAbuse = function(idx) {
      var mod = AbuseModal.choice($scope.myLendedIn[idx], $scope.reportAbuse2);
      mod();
    };

    $scope.reportAbuse2 = function(book, text) {
      $scope.createNotification(
        'Admin',
        "Abuse report from "+$scope.me.name+ ": "+ text);
    };

    $scope.returnBook = function(idx) {
      if (confirm('Are you sending the book back to the address on the cover?')) {
          var book = $scope.myLendedIn[idx];
          book.lendedTo = null;
          book.address = null;
          book.postalCode = null;
          book.city = null;
          book.lended = false;
          $scope.updateBook(book);
          $scope.myLendedIn.splice(idx,1);
          $scope.freeBooks.push(book);
          $scope.createNotification(
            book.owner.name,
            $scope.me.name+ " is sending your book '"+book.title+ "' back soon.");
      }
    };

    $scope.sendReminder = function(idx) {
      $scope.createNotification(
        $scope.myRequestedOut[idx].owner.name,
        "Please accept my book request for "+$scope.myRequestedOut[idx].title+ ". I can't wait to start reading.");
    };

    $scope.cancelRequest = function(idx) {
      var book = $scope.myRequestedOut[idx];
      book.requestedBy = null;
      book.address = null;
      book.postalCode = null;
      book.city = null;
      $scope.updateBook(book);
      $scope.myRequestedOut.splice(idx,1);
      $scope.freeBooks.push(book);
      $scope.createNotification(
        book.owner.name,
        $scope.me.name+ " has cancelled the request for your book "+book.title);
    };

    $scope.acceptRequest = function(idx) {
      var book = $scope.myRequestedIn[idx];
      book.lended = true;
      book.lendedTo = angular.copy(book.requestedBy);
      book.requestedBy = null;
      $scope.updateBook(book);
      $scope.myRequestedIn.splice(idx,1);
      $scope.myLendedOut.push(book);
      $rootScope._.remove($scope.myBooks, {
          _id: book._id
      });
      $scope.createNotification(
        book.lendedTo.name,
        $scope.me.name+ " has accepted your request for book "+book.title);
    };

    $scope.declineRequest = function(idx) {
      var reason = prompt('Why do you decline this request?');
      if (reason != null) {
          var book = $scope.myRequestedIn[idx];
          book.lended = false;
          var requestor = angular.copy(book.requestedBy);
          book.requestedBy = null;
          $scope.updateBook(book);
          $scope.myRequestedIn.splice(idx,1);
          $scope.freeBooks.push(book);
          $scope.createNotification(
            requestor.name,
            $scope.me.name+ " has declined your request for book "+book.title+'. Reason: '+reason);
      }
    };

    $scope.createNotification = function(username, text) {
        var notif = {
          forUserName: username,
          text: text,
          created:  new Date()
      };
      $http.post('/api/notifications', notif);
    };

    // Wait a while until really logged in
    setTimeout(function() {
        if ($scope.isLoggedIn()) {
          $scope.getMyBooks();
          $scope.getMyNotifications();
          $scope.getRequestedOut();
          $scope.getRequestedIn();
          $scope.getLendedOut();
          $scope.getLendedIn();
        }
      }, 300);


  });
