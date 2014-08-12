'use strict';

(function(){
	angular.module('prime', [])
	.service('factorise', function() {
		this.factorise = function(n) {
			var factors = [];
			n = n | 0;
			var l = Math.ceil(Math.sqrt(n)) | 0;
			for (var i = 2; i <= l; ++i)
				if (!(n % i)) {
					factors.push(i);
					n = (n / i) | 0;
					i = 1;
				}
			return factors;
		};
		this.test = function(n) {
			return factors.length == 0;
		};
	})
	.directive('prime', ['factorise', function(factorise) {
		// rofl lol its the prime directive hahahaha
		return {
			scope: {
				n: '=',
				result: '='
			},
			link: function(scope, element, attrs) {
				scope.$watch('n', function(n) {
					if (n > 0x8fffffff)
						scope.result = n + ' is too large.';
					else if (n < 2)
						scope.result = n + ' is too small';
					else {
						var factors = factorise.factorise(n);
						scope.result = n + (factors.length
							? ' = ' + factors.join(' \u2a09 ')
							: ' is prime');
					}
				});
			}
		};
	}]);
})();