'use strict';

(function(){
	angular.module('choose', [])
	.service('combinatorics', function() {
		this.factorial = function(a) {
			var f = a;
			while (a --> 2)
				f *= a;
			return f;
		};
		this.permutations = function(a, b) {
			var f = a, t = a - b + 1;
			while (a --> t)
				f *= a;
			return f;
		};
		this.combinations = function(a, b) {
			return this.permutations(a, b) / this.factorial(b);
		};
	})
	.controller('choose', ['combinatorics', '$scope', function(combinatorics, scope) {
		for (var key in combinatorics)
			scope[key] = combinatorics[key];
	}]);
})();