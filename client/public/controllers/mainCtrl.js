'use strict'

app.controller('MainCtrl', function ($scope, $http) {
  $scope.name = 'AliBaba'
  $scope.searching = false
  $scope.types = ['Standard', 'Gaming', 'CAD']
	$scope.searchInput = {
    budget: '',
    type: $scope.types[0]
  }
  $scope.computers = []

	$scope.doSearch = function ($event) {
    $scope.searching = true
    $scope.computers = []

    $http.get('/search', { params: $scope.searchInput })
    .success(function(data, status, headers, config) {
      console.log('success')
      console.log(data)
      $scope.computers = data.results
    })
    .error(function(data, status, headers, config) {
      console.log('ERROR')
      console.log(data)
    })
    .finally(function () {
      $scope.searching = false
    })
  }

})
