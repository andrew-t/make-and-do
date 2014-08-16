'use strict';

(function(){
	var factoriser = {
		factorise: function(n) {
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
		},
		factoriseBig: function(n) {
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
		},
		test: function(n) {
			return factorise(n).length == 1;
		},
		testBig: function(n) {
			return factoriseBig(n).length == 1;
		}
	};

	if (self.angular)
		angular.module('prime', ['big'])
		.service('factorise', function() {
			return factoriser;
		})
		.directive('prime', ['factorise', function(factorise) {
			// rofl lol its the prime directive hahahaha
			return {
				scope: {
					n: '=',
					processing: '='
				},
				template: '{{result}} <button ng-if="slow" ng-click="startSlow(n)">Calculate</button>',
				link: function(scope, element, attrs) {
					var worker = new Worker('primeworker.js');
					worker.postMessage('');
					worker.addEventListener('message', function(e) {
						scope.$apply(function() {
							scope.result = e.data.error || 
								(scope.n + (e.data.length > 1
									? ' = ' + e.data.join(' \u00d7 ')
									: ' is prime'));
							scope.slow = false;
							scope.processing = false;
						});
					});
					scope.startSlow = function(n) {
						worker.postMessage(n.toFixed(10));
						scope.slow = false;
						scope.processing = true;
					};
					scope.$watch('n', function(n) {
						if (!n) {
							scope.result = '';
							scope.slow = false;
						} else if (n.lt(2)) {
							scope.result = n + ' is too small';
							scope.slow = false;
						} else if (n.gt(1000000000)) { 
							scope.result = '';
							scope.slow = true;
						} else {
							scope.slow = false;
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
	else self.factorise = factoriser;
})();