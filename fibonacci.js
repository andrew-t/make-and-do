'use strict';

angular.module('fibonacci', ['th'])
.service('fibonacci', function(th) {
	this.name = function(n, init) {
		if (n)
			n += th(n);
		var monacci;
		switch (init.length) {
			case 2: monacci = 'Fibonacci'; break;
			case 3: monacci = 'tribonacci'; break;
			default: monacci = init.length + '-onacci'; break;
		}
		var terms;
		for (var i = 0; i < init.length; ++i)
			if (init[i] != 1) {
				terms = init.join(', ');
				break;
			}
		return (n ? 'The ' + n + ' ' : '') +
			monacci + ' number' + 
			(terms ? ' with initial terms ' + terms : '');
	};
	this.centred = function(n, m) {
		return 1 + m * n * (n - 1) * 0.5;
	};
	this.generalised = function(n, m) {
		return n * ((m - 2) * (n - 1) * 0.5 + 1);
	};
	// You really do have to provide one of these maxima, because I'm not going to check...
	this.allFibonacci = function(init, max, maxN) {
		for (var a = init.slice(); (!max || a[a.length - 1] < max) && (!maxN || a.length < maxN); ) {
			var next = 0;
			for (var i = 0; i < init.length; ++i)
				next += a[a.length -  1 - i];
			a.push(next);
		}
		return a;
	}
	this.fibonacci = function(init, n) {
		return this.allFibonacci(init, undefined, n).pop();
	}
});