angular.module('oto')
.controller('CardFormCtrl', ['$scope', '$filter', '$http', 'Auth', 'Stacks', 'Cards', '$fileUploader', function($scope, $filter, $http, Auth, Stacks, Cards, $fileUploader) {

   var resolvePost = {},
      resolveUpdate = {};

   var emptyCard = {
      title : '',
      content : '',
      duedate : ''
   };

   var uploadsListener = null;

   $scope.Cards = Cards;

   $scope.showForm = false;
   $scope.$watch('Cards.showForm', function (what) {
      $scope.showForm = what;
      if (!what) {
         //Reset on close
         resetCardForm();
      } else {
         $scope.cardFormCard = Cards.cardFormCard;
         initiate();
      }
   });

   function initiate() {
      //Define state depending or new or add
      if ($scope.cardFormCard) {
         if ($scope.countUploads > 0  || $scope.saving) {
            Cards.cardFormCard = null; //safeguard to not edit the same card twice
            return;
         }

         $scope.loadedCard = angular.copy($scope.cardFormCard);

         if ($scope.loadedCard.duedate) {
            $scope.loadedCard.duedate = $scope.loadedCard.duedate.substring(0, 10);
         }

         //New Card
         if ($scope.loadedCard._id.substring(0,3) == 'new') {
            $scope.cardFormAction = 'new';
         } else {
            $scope.cardFormAction = 'edit';
         }
      }
   }

   /*************
    *
    * CardForm Actions
    *
    ************/
   function resetCardForm() {
      //Set to initial state
      $scope.cardFormAction = 'new';

      fileAttachmentsAdded = [];
      fileAttachmentsRemoved = [];

      urlAttachmentsAdded = [];
      urlAttachmentsRemoved = [];

      $scope.attachmentsChanged = false;

      $scope.isLinkInputVisible = false;
      $scope.linkInputValue = 'http://www.google.com';

      //Take away error meassages
      $scope.titleError = false;
      $scope.titleErrorMessage = '';
      //Set temporary objects to empty
      $scope.loadedCard = _.clone(emptyCard);

      $scope.isLinkInputVisible = false;

      $scope.saving = false;
      $scope.countUploads = 0;
      $scope.progressByPosition=[];

      if (uploadsListener) {
         uploadsListener();
      }

      //Special
      $("#duedate").val('');
   }

   $scope.doCardFormAction = function() {
      if ($scope.cardForm.$invalid) {
         return; //safeguard
      }

      if ($scope.countUploads > 0) {
         uploadsListener = $scope.$watch('countUploads', function(newValue, oldValue) {
            if (newValue === 0 && oldValue > 0) {
               if ($scope.cardFormAction == 'edit') {
                  editCard();
               } else {
                  addCard();
               }
            }
         });

      } else {
         if ($scope.cardFormAction == 'edit') {
            editCard();
         } else {
            addCard();
         }
      }
   };

   var addCard = function() {
      $scope.saving = true;
      var newCard = $scope.loadedCard;
      var clientid = $scope.loadedCard._id;
      newCard.stackid = Stacks.activeStack._id;
      newCard.clientid = clientid;
      newCard.createdat = getDateWithTime();
      newCard.modifiedat = getDateWithTime();

      if (newCard.duedate == '') {
         newCard.duedate = null;
      }

      //Display card in UI
      Cards.cards.push(newCard);

      //Save card on server
      $http({
         method : 'POST',
         url : '/api/notes/cards/',
         headers : {
            'Content-Type' : 'application/x-www-form-urlencoded'
         },
         data : $.param({
            card : newCard,
            fileattachments : JSON.stringify(newCard.fileattachments),
            urlattachments : JSON.stringify(newCard.urlattachments),
            clientid: clientid
         })
      }).success(function(response) {
         var found = $filter('filter')(Cards.cards, {clientid:response.clientid});
         if (found.length === 1) {
            //Update parameters calculated on server
            found[0]._id = response.card._id;
            found[0].createdat = response.card.createdat;
            found[0].modifiedat = response.card.modifiedat;

            Cards.showForm = false;
            $scope.saving = false;
         } else {
            console.log(found);
            alert('Error saving card:' +  response.card._id);
         }
      }).error(function(error) {
         console.log(error);
      });
   };

   var editCard = function() {
      if ($scope.cardForm.$invalid) {
         return; //safeguard
      }
      $scope.saving = true;
      //Handle attachments first
      var filesToDelete = [];
      //1)Those in added AND removed --> delete
      jQuery.each(fileAttachmentsAdded, function(key, value) {
         if (fileAttachmentsRemoved.indexOf(value) > -1  && filesToDelete.indexOf(value) == -1) {
            filesToDelete.push(value);
         }
      });
      //2)Those in removed --> delete
      filesToDelete = filesToDelete.concat(fileAttachmentsRemoved);
      //3)those in added --> do nothing
      //-->DELETE
      if (filesToDelete.length > 0) {
         $http({
            method : 'POST',
            url : '/api/notes/deleteatts',
            headers : {
               'Content-Type' : 'application/x-www-form-urlencoded'
            },
            data : $.param({
               cardid : $scope.loadedCard._id,
               array : JSON.stringify(filesToDelete)
            })
         });
      }

      //Handle urls next the same way
      var urlsToDelete = [];
      jQuery.each(urlAttachmentsAdded, function(key, value) {
         if (urlAttachmentsRemoved.indexOf(value) > -1 && urlsToDelete.indexOf(value) == -1) {
            urlsToDelete.push(value);
         }
      });
      urlsToDelete = urlsToDelete.concat(urlAttachmentsRemoved);
      if (urlsToDelete.length > 0) {
         $http({
            method : 'POST',
            url : '/deletelink',
            headers : {
               'Content-Type' : 'application/x-www-form-urlencoded'
            },
            data : $.param({
               cardid : $scope.loadedCard._id,
               array : JSON.stringify(urlsToDelete)
            })
         });
      }

      var updatedCardToSend = $scope.loadedCard;
      updatedCardToSend.clientid = $scope.loadedCard._id;
      updatedCardToSend.modifiedat = getDateWithTime();

      if (updatedCardToSend.duedate == '') {
         updatedCardToSend.duedate = null;
      }

      //Display card in UI
      _.extend($scope.cardFormCard, updatedCardToSend); //previoulsy _.

      $http.put('/api/notes/cards/' + updatedCardToSend._id, updatedCardToSend)
         .success(function(updatedCard) {
            var filtered = $filter('filter')(Cards.cards, {_id : updatedCard._id});
            if (filtered.length === 1) {
               //Update paramters calculated on server
               Cards.cards[Cards.cards.indexOf(filtered[0])] = updatedCard;

               Cards.showForm = false;
               $scope.saving = false;
            } else {
               console.log(found);
               alert('Error saving card:' +  card._id);
            }
         })
         .error(function(error) {
            console.log(error);
         });
   };

   $scope.cancelCardForm = function() {
      Cards.showForm = false;
      if ($scope.cardFormAction === 'edit') {
         //Handle file attachments first
         var filesToDelete = [];
         //1)Those in added AND removed --> delete
         jQuery.each(fileAttachmentsAdded, function(key, value) {
            if (fileAttachmentsRemoved.indexOf(value) > -1  && filesToDelete.indexOf(value) == -1) {
               filesToDelete.push(value);
            }
         });
         //2)Those in removed --> delete
         filesToDelete = filesToDelete.concat(fileAttachmentsAdded);
         //3)those in added --> do nothing

         //Handle url attachments next and the same way
         var urlsToDelete = [];
         jQuery.each(urlAttachmentsAdded, function(key, value) {
            if (urlAttachmentsRemoved.indexOf(value) > -1 && urlsToDelete.indexOf(value) == -1) {
               urlsToDelete.push(value);
            }
         });
         urlsToDelete = urlsToDelete.concat(urlAttachmentsAdded);

         cleanAttsOnCancel(filesToDelete, urlsToDelete);


      } else {
         //remove ALL added
         cleanAttsOnCancel(fileAttachmentsAdded, urlAttachmentsAdded);
      }
   };

   function cleanAttsOnCancel(filesToDelete, urlsToDelete) {
      if (filesToDelete.length > 0) {
         $http({
            method : 'POST',
            url : '/api/notes/deleteatts',
            headers : {
               'Content-Type' : 'application/x-www-form-urlencoded'
            },
            data : $.param({
               cardid : $scope.loadedCard._id,
               array : JSON.stringify(filesToDelete),
               changeModifiedat : false
            })
         });
      }
      if (urlsToDelete.length > 0) {
         $http({
            method : 'POST',
            url : '/deletelink',
            headers : {
               'Content-Type' : 'application/x-www-form-urlencoded'
            },
            data : $.param({
               cardid : $scope.loadedCard._id,
               array : JSON.stringify(urlsToDelete),
               changeModifiedat : false
            })
         });
      }
   }

   //Save button enable/disable
   $scope.isSaveDisabled = function() {
      if ($scope.cardFormAction === 'edit') {
         //invalid is always bad:
         if ($scope.cardForm.$invalid) {
            return true;
         }

         if ($scope.countUploads > 0 || $scope.saving) {
            return true;
         }

         if ($scope.attachmentsChanged === true && angular.equals($scope.loadedCard, $scope.cardFormCard)) {
            return false;
         }
         if ($scope.attachmentsChanged === false && !angular.equals($scope.loadedCard, $scope.cardFormCard)) {
            return false;
         }
         if ($scope.attachmentsChanged === true && !angular.equals($scope.loadedCard, $scope.cardFormCard)) {
            return false;
         }

         return true;
      } else {
         return $scope.cardForm.$invalid;
      }
   };

   $scope.isLinkInputValueInvalid = function() {
      if ($scope.linkInputValue) {
         return false;
      } else {
         return true;
      }
   };

   //DRY with cardlistctrl
   $scope.attDownloadSrc = function(att) {
      return 'TODO';
   };

   $scope.attThumbSrc = function(att) {
      if (att.image) return att.image.thumb.defaultUrl;
      else return '/img/nothumb.png';
   };

   /*---------------------------------------------------------------------------------------------------------------------------------*/


   /*************
    *
    * File Uploader
    *
    * **********/

   var uploader = $fileUploader.create({
      url: '/upload',
      autoUpload: true,
      removeAfterUpload: true,
      scope:$scope,
      headers: {
         'X-XSRF-TOKEN': Auth.xsrfToken
      }
   });

   uploader.bind('afteraddingfile', function (event, item) {
      //console.info('After adding a file', item);
      var cardid = $scope.loadedCard._id,
         position = $scope.loadedCard.fileattachments.length;

      //Display empty thumb, will be filled later
      var newAtt = {
         filename : item.file.name,
         cardid: cardid,
         position: position
      };

      item.formData = [
         {
            cardid:cardid,
            att:JSON.stringify(newAtt)
         }
      ];

      $scope.loadedCard.fileattachments[position] = newAtt;

      $scope.progressByPosition[position] = 'init';

      $scope.countUploads++;
      $scope.$apply();
   });

   uploader.bind('progress', function (event, item, progress) {
      var att = JSON.parse(item.formData[0].att);
      var position = att.position;
      $scope.progressByPosition[position] = progress;
      if (progress == '100') $scope.progressByPosition[position] = 'storing';
      $scope.$apply();
   });

   uploader.bind('success', function (event, xhr, item, response) {
      $scope.loadedCard.fileattachments[response.position] = response;
      fileAttachmentsAdded.push(response._id);
      $scope.progressByPosition[response.position] = null;
      $scope.attachmentsChanged = true;

      $scope.countUploads--

      $scope.$apply();
   });

   uploader.bind('cancel', function (event, xhr, item) {
      //console.info('Cancel', xhr, item);
   });

   uploader.bind('error', function (event, xhr, item, response) {
      console.info('Error', xhr, item, response);
      $scope.progressByPosition[position] = 'error';
      $scope.countUploads--;
   });

   uploader.bind('complete', function (event, xhr, item, response) {
      //console.info('Complete', xhr, item, response);
   });

   $scope.removeAtt = function(att) {
      fileAttachmentsRemoved.push(att._id);
      $scope.loadedCard.fileattachments.splice($scope.loadedCard.fileattachments.indexOf(att), 1);
      $scope.attachmentsChanged = true;
   };


   /*******************
    *
    * Links
    *
    ********************/

   $scope.initAddLink = function() {
      $scope.isLinkInputVisible = true;
   };

   $scope.cancelAddLink = function() {
      $scope.isLinkInputVisible = false;
      $scope.linkInputValue = '';
   };

   $scope.addLink = function() {
      $scope.isLinkInputVisible = false;
      var cardid = $scope.loadedCard._id,
         clientid = makeid(),
         position = $scope.loadedCard.urlattachments.length;

      //Display empty thumb, will be filled later
      var newLink = {
         url : $scope.linkInputValue,
         clientid:clientid,
         cardid:cardid,
         position:position
      };

      $scope.loadedCard.urlattachments[position] = newLink;
      $scope.attachmentsChanged = true;

      //thumbService.storeThumbnail(cardid, clientid, null);

      $http({
         method:'POST',
         url: '/addlink/',
         type:'JSON',
         data: {
            cardid : cardid,
            att : JSON.stringify(newLink),
            clientid: clientid
         }
      })
      .success(function(data, status, headers, config) {
         urlAttachmentsAdded.push(data._id);

         //thumbService.storeThumbnail(config.data.cardid, data.clientid, data._id);
         //thumbService.changeStatus(data._id, 'done');
      })
      .error(function(error) {
         console.log(error);
      });
   };

   $scope.removeLink = function(att) {$scope.progressByPosition[position] = null;
      urlAttachmentsRemoved.push(att_id);
      $scope.loadedCard.urlattachments.splice($scope.loadedCard.urlattachments.indexOf(att), 1);
      $scope.attachmentsChanged = true;
   };

}]);