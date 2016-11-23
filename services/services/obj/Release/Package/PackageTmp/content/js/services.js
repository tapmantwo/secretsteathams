'use strict';
var module = angular.module('secretSanta.services', []);
module.service('secretSantaService',['$http', function($http) {
	return {
		getPickers: function(cb){
			$http({method: 'GET', url: '/pickers'}).
  				success(function(data, status, headers, config) {
  					cb(data);
				}).
  				error(function(data, status, headers, config) {    			
  				});
		},
		getTickets: function(pickerId, cb) {
			$http({method: 'GET', url: '/tickets/' + pickerId}).
  				success(function(data, status, headers, config) {
  					cb(data);
				}).
  				error(function(data, status, headers, config) {    			
  				});
		},
		pickedPerson: function(pickerId, ticketId, cb) {
			$http({method: 'POST', url: '/picked/' + pickerId + '/' + ticketId}).
  				success(function(data, status, headers, config) {
  					cb(data);
				}).
  				error(function(data, status, headers, config) {    			
  				});
		}
	}
}])