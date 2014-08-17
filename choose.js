'use strict';

angular.module('choose', [])
.service('combinatorics', function() {
	this.factorial = function(a) {
		var f = 1;
		if (a) do f *= a; while (a --> 2);
		return f;
	};
	this.factorialBig = function(a) {
		var f = new Big(1);
		if (a.gt(0)) do {
			f = f.times(a);
			a = a.minus(1);
		} while (a.gt(1));
		return f;
	};
	this.permutations = function(a, b) {
		var f = 1, t = a - b + 1;
		if (b) do f *= a; while (a --> t);
		return f;
	};
	this.permutationsBig = function(a, b) {
		var f = new Big(1), t = a.minus(b).plus(1);
		if (b.gt(0)) do {
			f = f.times(a);
			a = a.minus(1);
		} while (a.gte(t));
		return f;
	};
	this.combinations = function(a, b) {
		return this.permutations(a, b) / this.factorial(b);
	};
	this.combinationsBig = function(a, b) {
		return this.permutationsBig(a, b).div(this.factorialBig(b));
	};
})
.controller('choose', ['combinatorics', '$scope', function(combinatorics, scope) {
	for (var key in combinatorics)
		scope[key] = combinatorics[key];
}]);