'use strict';

(function(){
	angular.module('big', [])
	.directive('big', ['$timeout', function(timeout) {
		return {
			scope: {
				model: '=',
				disabled: '='
			},
			template: '<input type="text" pattern="^\\d+$" ng-model="raw" ng-class="{invalid: invalid}" ng-disabled="disabled" />',
			link: function(scope, element, attributes) {
				var ignoreBig, ignoreRaw;
				scope.$watch('raw', function(raw) {
					ignoreBig = true;
					if (!ignoreRaw)
						try {
							scope.model = new Big(raw || 0);
							scope.invalid = false;
						} catch(e) {
							//scope.model = null;
							scope.invalid = true;
						}
					timeout(function() {
						ignoreBig = false;
					});
				});
				scope.$watch('model', function(model) {
					ignoreRaw = true;
					if (!ignoreBig) {
						scope.raw = model.toFixed(0);
						scope.invalid = false
					}
					timeout(function() {
						ignoreRaw = false;
					});
				});
			}
		};
	}]);
})();