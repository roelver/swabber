/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Book = require('../api/book/book.model');
var User = require('../api/user/user.model');
var Notification = require('../api/notification/notification.model');
var user1, user2, user3;

User.find({}).remove(function() {
  User.create({
    provider: 'local',
    role: 'user',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test'
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }, {
    provider: 'local',
    role: 'user',
    name: 'OtherGuy',
    email: 'other@guy.com',
    password: 'other'
  }, function() {
      console.log('finished populating users');
      User.find({name: 'Test User'}, function(err, data) {
        if(err) { console.log('User1 not found '+err); return}
        user1 = data[0];
        console.log('User1:'+user1);
        User.find({name: 'Admin'}, function(err, data) {
          if(err) { console.log('User2 not found '+err); return}
          user2 = data[0];
          console.log('User2:'+user2);
          User.find({name: 'OtherGuy'}, function(err, data) {
            if(err) { console.log('User3 not found '+err); return}
            user3 = data[0];
            console.log('User3:'+user3);
            initBooks(user1, user2, user3);
          });
      });
    });
  });
});

var initBooks = function(user1, user2, user3) {
   console.log('Creating books for ', user1, user2);
    Book.find({}).remove(function() {
      Book.create({
        title: 'A nice book',
        coverImg: 'http://books.google.nl/books/content?id=Kf5PAAAAcAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
        owner: user1,
        lended: false
      }, {
        title: 'The best book ever written',
        coverImg: "http://books.google.nl/books/content?id=Abk6AAAAcAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
        owner: user2,
        lended: true,
        lendedTo: user1
      }, {
        title: 'The worst book ever written',
        coverImg: "http://books.google.nl/books/content?id=KP5PAAAAcAAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
        owner: user1,
        lended: false,
        requestedBy: user2
      },  {
        title: 'No title required',
        coverImg: "http://books.google.nl/books/content?id=_nhLAAAAcAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
        owner: user1,
        lended: true,
        lendedTo: user3,
        requestedBy: user2
      },  {
        title: 'A book to remember',
        coverImg: 'http://books.google.nl/books/content?id=jM9xmZ-q7QYC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
        owner: user2,
        lended: false
      },{
        title: 'The biggest challenge ever',
        coverImg: 'http://books.google.nl/books/content?id=ol48uX7CLiUC&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        owner: user1,
        lended: false
      },{
        title: 'The biggest challenge ever - part 2',
        coverImg: 'http://books.google.nl/books/content?id=2NVmAAAAMAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        owner: user1,
        lended: false,
        requestedBy: user3
      },{
        title: 'My only book',
        coverImg: 'https://books.google.nl/books/content?id=CKzvBgAAQBAJ&printsec=frontcover&img=1&zoom=1&h=160&stbn=1',
        owner: user3,
        lended: false
      }, function() {
          console.log('finished populating books for '+user1.name+' and '+user2.name);
        }
      );
    });
    Notification.find({}).remove(function() {
      Notification.create({
        text: 'This is a serious notification',
        forUserName: user1.name,
        created: new Date()
      },
      {
        text: 'This is a hilarious notification :-)',
        forUserName: user1.name,
        created: new Date()
      },
      {
        text: 'Do not delete this notification, even if you can',
        forUserName: user1.name,
        created: new Date()
      },
      {
        text: 'This is a hilarious notification :-)',
        forUserName: user3.name,
        created: new Date()
      }, function() {
          console.log('finished populating notifications for '+user1.name+' and '+user3.name);
        }
      );
    });
};

