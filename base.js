'use strict';

angular.module('base', ['rebase'])
.directive('base', ['baseConverter', '$timeout', function(service, timeout) {
	var id = 1;
	return {
		restrict: 'A',
		scope: {
			base: '=',
			number: '='
		},
		transclude: true,
		template: '<label for="base-{{id}}">{{label}}</label><input name="base-{{id}}" type="text" ng-model="based" ng-class="{ invalid: invalid }"></input>',
		link: function (scope, element, attrs) {
			var ignoreBased = false;
			scope.id = id++;
			scope.label = attrs.label;
			function update(force) {
				if (scope.base > 1 && scope.number !== undefined) {
					ignoreBased = true;
					//console.log('converting ' + scope.number + ' to base ' + scope.base);
					if (!force) {
						var parsed = scope.based && service.fromString(scope.based, scope.base);
						if (!parsed || !parsed.eq(scope.number))
							force = true;
					}
					if (force)
						scope.based = service.toString(scope.number, scope.base, scope.$parent.decimalPlaces);
					scope.invalid = false;
					timeout(function() {
						ignoreBased = false;
					});
				} //else console.log('ignoring ' + scope.number + ' at base ' + scope.base);
			};
			scope.$watch('base', function() { update(false); });
			scope.$watch('number', function() { update(false); });
			scope.$parent.$watch('decimalPlaces', function() { update(true); });
			scope.$watch('based', function(value) {
				if (ignoreBased || !value || !scope.based) {
					//console.log('ignoring ' + scope.number + ' from base ' + scope.base);
					return;
				}
				//console.log('converting ' + value + ' from base ' + scope.base);
				var parsed = service.fromString(value, scope.base);
				if (parsed === undefined)
					scope.invalid = true;
				else {
					scope.invalid = false;
					if (!scope.number.eq(parsed))
						scope.number = parsed;
				}
			});
		}
	};
}])
.controller('number', ['$scope', 'baseConverter', function(scope, service) {
	scope.bases = [];
	scope.decimalPlaces = 10;
	var id = 1;
	scope.addBase = function(base) {
		scope.bases.push({
			id: id++,
			base: parseInt(base, 10) || 10
		});
	};
	scope.remove = function(id) {
		for (var i = 0; i < scope.bases.length; ++i)
			if (scope.bases[i].id == id)
				scope.bases.splice(i, 1);
	};
	var handler = function() {
		scope.rebased = scope.rebases &&
			service.allYourBase(scope.string, scope.rebases.split(/[,;]\s*/g).map(function(n) { return parseInt(n, 10); }));
	};
	scope.$watch('string', handler);
	scope.$watch('rebases', handler);
	for (var i = 2; i <= 36; ++i)
		scope.rebases = (scope.rebases ? scope.rebases + '; ' : '') + i;
	scope.$watch(function() {
		scope.hash = '#' + scope.number.toString() +
			'-in-' + scope.bases.map(function(i) { return i.base; }).join(',') +
			'-to-' + scope.decimalPlaces;
	});
	var bases;
	if (window.location.hash) {
		var bits = window.location.hash.substr(1).split('-');
		scope.number = new Big(bits[0]);
		bases = bits[2].split(',').map(function(i) { return parseInt(i, 10); });
		scope.decimalPlaces = parseInt(bits[4], 10);
	} else {
		scope.number = new Big(643934984);
		bases = [2, 10, 16, 36];
	}
	bases.forEach(scope.addBase);
}]);