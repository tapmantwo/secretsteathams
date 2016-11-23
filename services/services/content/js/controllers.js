'use strict';

/* Controllers */

var module = angular.module('secretSanta.controllers', []);
module.controller('mainController', ['$scope', 'secretSantaService', function($scope, secretSantaService) {
	$scope.pickers = null;

	secretSantaService.getPickers(function(pickers) {
		$scope.pickers = pickers;
	});

	$scope.selectedPicker = null;
	$scope.pickedPerson = null;
	$scope.tickets = null;
	$scope.emailAddress = "";
	$scope.emailConfirm = "";    
    
	var pageModes = ['selectPicker', 'email', 'pick', 'results', 'alreadyPicked'];
	$scope.mode = 'selectPicker';

    $scope.pickerSelected = function(picker) {
        $scope.selectedPicker = picker;
        if (picker.alreadyPicked) {
            $scope.mode = 'alreadyPicked';
        } else {
            secretSantaService.getTickets(picker.id, function (tickets) {                
                $scope.tickets = tickets;
                $scope.mode = 'email';
            });
        }
    };
    
    $scope.emailInvalid = false;
    $scope.emailErrors = [];

    $scope.emailIsValid = function () {
        var valid = true;
        $scope.emailErrors = [];
        if ($scope.emailAddress.length === 0 || !$scope.ss.emailInput.$valid) {
            $scope.emailErrors.push("Please enter a valid email address");
            valid = false;
        }

        if ($scope.emailConfirm.length === 0) {
            $scope.emailErrors.push("Please confirm your email address");
            valid = false;
        }
        
        if ($scope.emailAddress != $scope.emailConfirm) {
            $scope.emailErrors.push("Your email address and the confirmation email address do not match.");
            valid = false;
        }

        return valid;
    };

    $scope.emailEntered = function() {
        if ($scope.emailIsValid()) {
            $scope.emailInvalid = false;
            $scope.mode = 'pick';
        } else {
            $scope.emailInvalid = true;
        }
    };

    $scope.resentEmailAddress = "";

    $scope.resendEmail = function() {
        secretSantaService.resendEmail($scope.selectedPicker.id, function(address) {
            $scope.resentEmailAddress = address;
        });
    };

	$scope.picked = function(ticketId) {
	    secretSantaService.pickedPerson($scope.selectedPicker.id, ticketId, $scope.emailAddress, function(person) {
			$scope.pickedPerson = person;
			$scope.mode = 'results';
		});
	};

    $scope.showLikes = function() {
        return $scope.pickedPerson && hasValue($scope.pickedPerson.likes);
    };

    function hasValue(toCheck) {
        return angular.isDefined(toCheck) && toCheck !== null && toCheck.length > 0;
    };
}]);
