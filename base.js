'use strict';

(function(){
	angular.module('base', [])
	.directive('base', ['$timeout', function(timeout) {
		var id = 1;
		return {
			restrict: 'A',
			scope: {
				base: '=',
				number: '='	
			},
			transclude: true,
			template: '<label for="base-{{id}}">Value</label><input name="base-{{id}}" type="text" ng-model="based" ng-class="{ invalid: invalid }"></input>',
			link: function (scope, element, attrs) {
				scope.id = id++;
				// TODO - this could be beefed up to allow non-integer bases and numbers, and numbers above 2^32
				function update() {
					if (scope.base > 1 && scope.base <= 36 && scope.number !== undefined) {
						console.log('converting ' + scope.number + ' to base ' + scope.base);
						scope.based = scope.number.toString(scope.base);
						scope.invalid = false;
					}
				};
				scope.$watch('base', update);
				scope.$watch('number', update);
				scope.$watch('based', function(value) {
					console.log('converting ' + value + ' to base ' + scope.base);
					var parsed = parseInt(value, scope.base);
					if (!(scope.invalid = (isNaN(parsed) || parsed.toString(scope.base) != value)))
						scope.number = parsed;
				});
			}
		};
	}]).controller('number', ['$scope', function(scope) {
		scope.bases = [];
		var id = 1;
		if (scope.number == undefined)
			scope.number = 643934984;
		scope.addBase = function(base) {
			scope.bases.push({
				id: id++,
				base: parseInt(base, 10) || 10,
				remove: function(id) {
					for (var i = 0; i < scope.bases.length; ++i)
						if (scope.bases[i].id == id)
							scope.bases.splice(i, 1);
				}
			});
		};
		[2, 10, 16, 36].forEach(scope.addBase);
	}]);
})();