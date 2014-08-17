'use strict';

angular.module('polygon', [])
.service('polygon', function() {
	this.centred = function(n, m) {
		// TODO - maths this into one line.
		var x = 1;
		for (var i = 1; i <= n; ++i)
			x += i * m;
		return x;
	};
	this.generalised = function(n, m) {
		// TODO - maths this into one line.
		var x = 1;
		for (var i = 1; i <= n; ++i)
			x += i * (m - 2) + 1;
		return x;
	};
});