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

	if (self.angular)
		angular.module('factorise', [])
		.service('factorise', function() {
			return factoriser;
		});
	else self.factorise = factoriser;
})();