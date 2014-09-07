'use strict';

angular.module('big', [])
.directive('big', ['$timeout', function(timeout) {
	// Javascript supports 32-bit integers, and variable-precision 'floating-point' numbers of almost any size.
	// That's good enough for almost all purposes, but I was described by the Guardian as "frighteningly anal",
	// so I've imported Big.js, which supports almost unlimited precision, and made this input box so you can
	// enter them on the website.
	return {
		scope: {
			model: '=',
			disabled: '=bigDisabled'
		},
		template: '<input type="text" pattern="^\\d+$" ng-model="raw" ng-class="{invalid: invalid}" ng-disabled="disabled" />',
		link: function(scope, element, attributes) {
			var ignoreBig, ignoreRaw;
			if (scope.model)
				scope.raw = scope.model.toString();
			scope.$watch('raw', function(raw) {
				// When you update the text box, we create a Big number, and update the scope,
				// unless you entered something invalid.
				ignoreBig = true;
				if (!ignoreRaw)
					try {
						scope.model = new Big(raw || 0);
						scope.invalid = false;
					} catch(e) {
						scope.invalid = true;
					}
				timeout(function() {
					ignoreBig = false;
				});
			});
			scope.$watch('model', function(model) {
				// When the Big number changes, update the text box.
				// We ignore changes in one when we've updated the other to prevent an infinite loop.
				// (Unfortunately scientists haven't found a way to make each iteration take half as long as the last one;
				// then we could just wait the infinite loop out.)
				ignoreRaw = true;
				if (!ignoreBig) {
					scope.raw = model.toString();
					scope.invalid = false
				}
				timeout(function() {
					ignoreRaw = false;
				});
			});
		}
	};
}]);