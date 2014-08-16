'use strict';

(function(){
	angular.module('prime', ['big'])
	.service('factorise', function() {
		this.factorise = function(n) {
			if (n < 1)
				return [];
			var factors = [];
			n = n | 0;
			var l = Math.ceil(Math.sqrt(n)) | 0;
			for (var i = 2; i <= l; ++i)
			for (var i = new Big(2); i.lte(l); i = i.plus(1))
				if (!(n % i)) {
					factors.push(i);
					n = (n / i) | 0;
					i = 1;
				}
			if (n > 1)
				factors.push(n);
			return factors;
		};
		this.factoriseBig = function(n) {
			if (n.lt(1))
				return [];
			n = n.round(0);
			var factors = [],
				l = n.sqrt().round(0).plus(1);
			for (var i = new Big(2); i.lte(l); i = i.plus(1))
				if (n.mod(i).eq(0)) {
					factors.push(i);
					n = n.div(i);
					i = new Big(1);
				}
			if (n.gt(1))
				factors.push(n);
			return factors;
		};
		this.test = function(n) {
			return factorise(n).length == 1;
		};
		this.testBig = function(n) {
			return factoriseBig(n).length == 1;
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
					if (!n)
						scope.result = '';
					else if (n.lt(2))
						scope.result = n + ' is too small';
					else {
						var factors = factorise.factoriseBig(n);
						scope.result = n + (factors.length > 1
							? ' = ' + factors.map(function(f) {
									return f.toFixed(0);
								}).join(' \u00d7 ')
							: ' is prime');
					}
				});
			}
		};
	}]);
})();