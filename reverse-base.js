'use strict';

angular.module('reverseBase', ['rebase'])
.controller('reverseBase', ['$scope', 'baseConverter', function(scope, service) {
	// This function updates the output whenever you do anything.
	var handler = function() {
		scope.rebased = scope.rebases &&
			service.allYourBase(scope.string, scope.rebases.split(/[,;]\s*/g).map(function(n) { return parseInt(n, 10); }));
		scope.rebased.forEach(function (b) {
			b.number = b.number.toFixed(scope.decimalPlaces).replace(/(\..*?)0+$/, '$1').replace(/\.$/, '');
		});
		// This updates the permalink.
		scope.hash = '#' + scope.string.toString() +
			'-in-' + scope.rebases.replace(/[;,]\s+/g, ',') +
			'-to-' + scope.decimalPlaces;
	};
	scope.$watch('string', handler);
	scope.$watch('rebases', handler);
	scope.$watch('decimalPlaces', handler);

	// This imports values from the URL bar, or else uses defaults.
	if (window.location.hash) {
		var bits = window.location.hash.substr(1).split('-');
		scope.string = bits[0];
		scope.rebases = bits[2].replace(/[;,]\s+/g, '; ');
		scope.decimalPlaces = parseInt(bits[4], 10);
	} else {
		scope.string = '1248';
		for (var i = 2; i <= 36; ++i)
			scope.rebases = (scope.rebases ? scope.rebases + '; ' : '') + i;
		scope.decimalPlaces = 10;
	}
}]);