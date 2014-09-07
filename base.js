'use strict';

angular.module('base', ['rebase'])
.directive('base', ['baseConverter', '$timeout', function(service, timeout) {
	// An input box that returns a number, and works in any base.
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
					if (!force) {
						var parsed = scope.based && service.fromString(scope.based, scope.base);
						if (!parsed || !parsed.eq(scope.number))
							force = true;
					}
					if (force)
						scope.based = service.toString(scope.number, scope.base, scope.$parent.decimalPlaces);
					scope.invalid = false;
					timeout(function() {
						// This is in a timeout so it happens *after* everything that this update would normally trigger
						// has checked this flag and moved on.
						ignoreBased = false;
					});
				}
			};
			scope.$watch('base', function() { update(false); });
			scope.$watch('number', function() { update(false); });
			scope.$parent.$watch('decimalPlaces', function() { update(true); });
			scope.$watch('based', function(value) {
				// This runs when the user updates the number edit box for this base.
				if (!ignoreBased && value && scope.based) {
					var parsed = service.fromString(value, scope.base);
					if (parsed === undefined)
						scope.invalid = true;
					else {
						scope.invalid = false;
						if (!scope.number.eq(parsed))
							scope.number = parsed;
					}
				}
			});
		}
	};
}])
.controller('number', ['$scope', 'baseConverter', function(scope, service) {
	// This controller handles the whole page, adding and removing bases, and such things.
	var nextId = 1;
	scope.addBase = function(base) {
		scope.bases.push({
			id: nextId++,
			base: parseInt(base, 10) || 10
		});
	};
	scope.remove = function(id) {
		for (var i = 0; i < scope.bases.length; ++i)
			if (scope.bases[i].id == id)
				scope.bases.splice(i, 1);
	};

	// This updates the permalink URL whenever anything changes.
	// We could update the URL bar itself but that would mean you'd have to hit 'back' about a thousand times
	// to get back to the index page.
	scope.$watch(function() {
		scope.hash = '#' + scope.number.toString() +
			'-in-' + scope.bases.map(function(i) { return i.base; }).join(',') +
			'-to-' + scope.decimalPlaces;
	});

	// This part loads a state from either the page hash or the baked-in defaults:
	var bases;
	if (window.location.hash) {
		var bits = window.location.hash.substr(1).split('-');
		scope.number = new Big(bits[0]);
		bases = bits[2].split(',').map(function(i) { return parseInt(i, 10); });
		scope.decimalPlaces = parseInt(bits[4], 10);
	} else {
		// This is the default state
		scope.number = new Big(643934984);
		bases = [2, 10, 16, 36];
		scope.decimalPlaces = 10;
	}
	scope.bases = [];
	bases.forEach(scope.addBase);
}]);