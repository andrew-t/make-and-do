'use strict';

(function(){
	var factoriser = {
		// Factorise takes an integer and returns an array of its prime factors.
		// (This can be done in a single line but it's ghastly and probably slower.)
		// (I mean, insofar as 'a single line' is ameaningful concept in Javascript.)
		factorise: function(n) {
			if (n < 1)
				return [];
			var factors = [];
			n = n | 0;
			var l = Math.ceil(Math.sqrt(n)) | 0;
			for (var i = 2; i <= l; ++i)
				if (!(n % i)) {
					factors.push(i);
					n = (n / i) | 0;
					l = Math.ceil(Math.sqrt(n)) | 0;
					i = 1;
				}
			if (n > 1)
				factors.push(n);
			return factors;
		},
		// FactoriseBig does the same thing with big.js 'Big' numbers.
		factoriseBig: function(n, callback) {
			if (n.lt(1))
				return [];
			n = n.round(0);
			var factors = [],
				l = n.sqrt().round(0).plus(1);
			for (var i = new Big(2); i.lte(l); i = i.plus(1))
				if (n.mod(i).eq(0)) {
					factors.push(i);
					if (callback)
						callback(factors);
					n = n.div(i);
					l = n.sqrt().round(0).plus(1);
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

	// If this file is imported normally and AngularJS is loaded, register a service.
	// If it's imported into a web worker, or AngularJS isn't present,
	// then just sling it on the global scope.
	if (self.angular)
		angular.module('factorise', [])
		.service('factorise', function() {
			return factoriser;
		});
	else self.factorise = factoriser;
})();