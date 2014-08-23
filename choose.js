'use strict';

angular.module('choose', [])
.service('combinatorics', function() {
	var self = this;
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
		return self.permutations(a, b) / self.factorial(b);
	};
	this.combinationsBig = function(a, b) {
		return self.permutationsBig(a, b).div(self.factorialBig(b));
	};
})
.controller('choose', ['combinatorics', '$scope', function(combinatorics, scope) {
	for (var key in combinatorics)
		if (!/Big$/.test(key))
			scope[key] = combinatorics[key];
	if (window.location.hash) {
		var bits = window.location.hash.substr(1).split('C');
		scope.a = parseInt(bits[0], 10);
		scope.b = parseInt(bits[1], 10);
	}
}])
.controller('choose-big', ['combinatorics', '$scope', function(combinatorics, scope) {
	for (var key in combinatorics)
		if (/Big$/.test(key))
			scope[key.substr(0, key.length - 3)] = combinatorics[key];
	if (window.location.hash) {
		var bits = window.location.hash.substr(1).split('C');
		scope.a = new Big(bits[0]);
		scope.b = new Big(bits[1]);
	}
}]);