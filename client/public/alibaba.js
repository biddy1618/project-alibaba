'use strict'

var app = angular.module('alibaba', ['ngRoute', 'ngResource', 'ngAnimate', 'ngMaterial'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      })
  })
  .directive('inputNumber', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModelController) {
        ngModelController.$parsers.push(function(data) {
          // debug
          // console.log('parsers', data)
          //convert data from view format to model format
          var output = data.replace(/[^0-9]/g, '')
          ngModelController.$setViewValue(output)
          ngModelController.$render()
          return output
        })

        ngModelController.$formatters.push(function(data) {
          // debug
          // console.log('formatters', data)
          //convert data from model format to view format
          return data.replace(/[^0-9]/g, '')
        })
      }
    }
  })
