'use strict';
var module = angular.module('secretSanta.services', []);
module.service('secretSantaService',['$http', function($http) {
    return {
        getPickers: function(cb) {
            $http({ method: 'GET', url: '/pickers' }).
                success(function(data, status, headers, config) {
                    cb(data);
                }).
                error(function(data, status, headers, config) {
                });
        },
        getTickets: function(pickerId, cb) {
            $http({ method: 'GET', url: '/tickets/' + pickerId }).
                success(function(data, status, headers, config) {
                    cb(data);
                }).
                error(function(data, status, headers, config) {
                });
        },
        pickedPerson: function(pickerId, ticketId, email, cb) {
            $http({ method: 'POST', url: '/picked/' + pickerId + '/' + ticketId + "/" + email }).
                success(function(data, status, headers, config) {
                    cb(data);
                }).
                error(function(data, status, headers, config) {
                });
        },
        resendEmail: function(pickerId, cb) {
            $http({ method: 'POST', url: '/resend/' + pickerId }).
                success(function(data, status, headers, config) {
                    cb(data);
                }).
                error(function(data, status, headers, config) {
                });
        }
    };
}])