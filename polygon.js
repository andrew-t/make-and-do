'use strict';

(function(){
	angular.module('polygon', [])
	.service('polygon', function() {
		this.centered = function(n) {
			// TODO - maths this into one line.
			var m = 1;
			for (var i = 1; i <= n; ++i)
				m += i * n;
			return m;
		};
		this.generalised = function(n) {
			// TODO - maths this into one line.
			var m = 1;
			for (var i = 1; i <= n; ++i)
				m += i * (n - 2) + 1;
			return m;
		};
	});
})();