'use strict';
angular.module('oto')
.controller('NotesViewCtrl', ['$scope', '$uibModal', 'Stacks', 'Cards', function($scope, $uibModal, Stacks, Cards) {
   /********************
    *
    * parent scope variables
    *
    ******************/

   $scope.activestack = {
      'title':'',
      '_id':''
   };

   $scope.orderProp = '-modifiedat';
   $scope.setOrder = function(orderProp) {
      $scope.orderProp = orderProp;
   };

   $scope.activeCard = Cards.activeCard;

   $scope.Cards = Cards;

   $scope.$watch('Cards.cardFormCard', function(newCard) {
      $scope.cardFormCard = newCard;
   }, true);
   $scope.showForm = false;
   $scope.$watch('Cards.showForm', function (what) {
      $scope.showForm = what;
   });

   /********************
    *
    * parent scope methods
    *
    ******************/

   $scope.inArchive = function() {
      return $scope.activestack._id === 'archive' ? true : false;
   };

   //Stacktitle by stackid. In the card I only store id
   //TODO: put into stacks factory  and avoid stacks on parent scope? by using service in other controllers
   $scope.getStacktitle = function(stackid) {
      var stack = $scope.stacks.filter(function(stack) {
         if (stack['_id'] === stackid) {
            return stack;
         }
      });
      if (stack.length === 1) {
         return stack[0].title;
      } else {
         return 'Floating';
      }
   };

   /********************
    *
    * Retrieve data for models
    *
    ******************/

   $scope.stacks = [];
   //TODO: put into factory initialization?
   //what about stack add/remove/rename?, avoid stacks on parent scope? by using service in other controllers
   $scope.floatingStack = $scope.activestack = {title: 'Floating'}; //initial value
   Stacks.getAll(
      function (allStacks, floatingStack) {
         $scope.stacks = allStacks;
         $scope.floatingStack = floatingStack;
         $scope.search = floatingStack._id; //show only cards of default stack
         $scope.activestack = floatingStack;
         Stacks.activeStack = floatingStack;
      }
   );

   $scope.cards = [];

   $scope.$watch('Cards.cards', function(newCards) {
      $scope.cards = newCards;
   }, true)

   Cards.getAll(
      function(cards) {
         Cards.cards = cards;
         //Keep as array of objects. The controller will regroup by sorting when parameters change
         $scope.cardGroups = [{
            'label': 'unsorted',
            'cards': $scope.cards
         }];
      },
      function(error) {
         console.log(error);
      }
   );


   /******************
    *
    * Cards Header
    *
    *************/

   $scope.startAddCard = function() {
      if ($scope.inArchive()) {
         return; //safeguard
      }

      var card = {
          _id: 'new' + makeid(),
          title : '',
          content : '',
          duedate : '',
          fileattachments: [],
          urlattachments: []
      };
      Cards.cardFormCard = card;
      Cards.showForm = true;


      /*var modalInstance = $modal.open({
         templateUrl: '/js/notes/cardFormModal.html',
         controller: 'CardFormModalInstanceCtrl',
         scope: $scope,
         resolve: {
            CardToEdit:function() {
               return null;
            }
         }
      });*/
   };

   //Active Card actions
   $scope.startEditCard = function(card) {
      if ($scope.inArchive()) {
         return; //safeguard
      }
      Cards.cardFormCard = card;
      Cards.showForm = true;
   };

   $scope.removeCard = function(card) {
      Cards.setCardFormCard(null);
      if ($scope.inArchive()) {
         Cards.remove(
            card._id,
            function() {
               $scope.cards.splice($scope.cards.indexOf(card), 1);
            },
            function(error) {
               console.log(error);
            }
         );
      } else {
         Cards.archive(
            card._id,
            $scope.getStacktitle(card.stackid),
            function(updatedCard) {
               $scope.cards[$scope.cards.indexOf(card)] = updatedCard;
            },
            function(error) {
               console.log(error);
            }
         );
      }
   };

   $scope.moveCard = function(card, stackid) {
      Cards.move(
         card._id,
         stackid,
         function(updatedCard) {
            $scope.cards[$scope.cards.indexOf(card)] = updatedCard;
         },
         function(error) {
            console.log(error);
         }
      );
   };

  $scope.openDetails = function (card) {
    var modalInstance = $uibModal.open({
      templateUrl: '/js/notes/cardDetailsModal.html',
      controller: CardDetailsModalInstanceCtrl,
      resolve: {
        card: function () {
          return card;
        }
      }
    });
  };

   /*******************
    *
    * Utility Functions
    *
    ********************/
   $scope.isNotNull = function(value) {
      return value == null ? false : true;
   };

   $scope.dropdown = function(element) {
      $(element).dropdown('toggle');
   };

}]);


/**************
 *
 * CARD DETAILS MODAL
 *
 ***************/
var CardDetailsModalInstanceCtrl = function ($scope, $uibModalInstance, card) {
  $scope.card = card;

  $scope.ok = function () {
    $uibModalInstance.close();
  };

};
