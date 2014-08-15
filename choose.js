'use strict';

(function(){
	angular.module('choose', [])
	.service('combinatorics', function() {
		this.factorial = function(a) {
			var f = 1;
			if (a) do f *= a; while (a --> 2);
			return f;
		};
		this.permutations = function(a, b) {
			var f = 1, t = a - b + 1;
			if (b) do f *= a; while (a --> t);
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