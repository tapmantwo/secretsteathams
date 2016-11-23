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

	var pageModes = ['selectPicker', 'pick', 'results', 'alreadyPicked'];
	$scope.mode = 'selectPicker';

	$scope.pickerSelected = function(picker) {		
		$scope.selectedPicker = picker;
		if ( picker.alreadyPicked) {
			$scope.mode = 'alreadyPicked';
		} else {
			secretSantaService.getTickets(picker.id, function(tickets) {
				$scope.tickets = tickets;
				$scope.mode = 'pick';
			});
		}
	}

	$scope.picked = function(ticketId) {
		secretSantaService.pickedPerson($scope.selectedPicker.id, ticketId, function(person) {
			$scope.pickedPerson = person;
			$scope.mode = 'results';
		});
	};

	$scope.showLikes = function() {
		return hasValue($scope.pickedPerson.likes);
	}

	function hasValue(toCheck) {
		return angular.isDefined(toCheck) && toCheck !== null && toCheck.length > 0;
	}
}]);
