'use strict';

(function(){
	angular.module('base', [])
	.service('baseConverter', function() {
		this.digits = '0123456789abcdefghijklmnopqrstuvwxyz';
		this.toString = function(n, radix, dp) {
			var prefix = '';
			if (n.lt(0)) {
				n = n.times(-1);
				prefix = '-';
			}
			var str = '',
				frac = n.mod(1),
				integer = n.minus(frac);
			while (integer.gt(0)) {
				var d = integer.mod(radix);
				str = this.digits[d] + str;
				integer = integer.minus(d).div(radix);
			}
			if (frac.gt(0)) {
				str += '.';
				var ratio = (new Big(1)).div(radix);
				for (var i = 0; i < dp; ++i) {
					for (var p = radix - 1; p >= 0; --p) {
						var x = ratio.times(p);
						if (frac.gte(x)) {
							str += this.digits[p];
							frac = frac.minus(x).times(radix);
							if (frac.lte(0))
								return prefix + str;
							break;
						}
					}
				}
				if (frac.gte(0.5)) {
					var maxDigit = this.digits[radix - 1];
					str = str.replace(new RegExp('\.?' + maxDigit + '+$'), '');
					str = str.substr(0, str.length - 1) + this.digits[this.digits.indexOf(str[str.length - 1]) + 1];
				}
			}
			return prefix + str;
		};
		this.fromString = function(n, radix) {
			var value = new Big(0),
				factor = 1;
			if (/^-/.test(n)) {
				n = n.substr(1);
				factor = -1;
			}
			var digits = n.split('');
			for (var i = 0; i < digits.length; ++i) {
				if (/[\.,]/.test(digits[i])) {
					var n = new Big(1);
					while (++i < digits.length)
						value = value.plus((n = n.div(radix)).times(this.digits.indexOf(digits[i])));
					break;
				}
				var d = this.digits.indexOf(digits[i]);
				if (d >= radix || d < 0)
					return;
				value = value.times(radix).plus(d);
			}
			return value.times(factor);
		};
	})
	.directive('base', ['baseConverter', '$timeout', function(service, timeout) {
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
				var ignoreBased = false;
				scope.id = id++;
				function update(force) {
					if (scope.base > 1 && scope.base <= 36 && scope.number !== undefined) {
						ignoreBased = true;
						console.log('converting ' + scope.number + ' to base ' + scope.base);
						if (force || !scope.based || !service.fromString(scope.based, scope.base).eq(scope.number))
							scope.based = service.toString(scope.number, scope.base, scope.$parent.decimalPlaces);
						scope.invalid = false;
						timeout(function() {
							ignoreBased = false;
						});
					} else console.log('ignoring ' + scope.number + ' at base ' + scope.base);
				};
				scope.$watch('base', function() { update(false); });
				scope.$watch('number', function() { update(false); });
				scope.$parent.$watch('decimalPlaces', function() { update(true); });
				scope.$watch('based', function(value) {
					if (ignoreBased || !value || !scope.based) {
						console.log('ignoring ' + scope.number + ' from base ' + scope.base);
						return;
					}
					console.log('converting ' + value + ' from base ' + scope.base);
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
	.controller('number', ['$scope', function(scope) {
		scope.bases = [];
		scope.decimalPlaces = 10;
		var id = 1;
		if (scope.number == undefined)
			scope.number = new Big(643934984);
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