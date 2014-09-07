'use strict';

angular.module('fibonacci', ['th'])
.service('fibonacci', ['th', function(th) {
	// Fibonacci functions. 'init' always refers to the initial, fixed terms —
	// that is, [1, 1] for the classical Fibonacci sequence.

	// Invent a name for a Fibonacci-style sequence (or term therein):
	this.name = function(n, init) {
		if (n)
			n += th(n);
		var monacci;
		switch (init.length) {
			case 2: monacci = 'Fibonacci'; break;
			case 3: monacci = 'tribonacci'; break;
			default: monacci = init.length + '-onacci'; break;
		}
		var terms = init.join(', ');
		return (n ? 'The ' + n + ' ' : '') +
			monacci + ' number' + 
			(terms != '1, 1' ? ' with initial terms ' + terms : '');
	};

	// allFibonacci generates a whole sequence, stopping after 'maxN' terms or when any term exceeds 'max'
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
	
	// Get the nth term in a sequence
	this.fibonacci = function(init, n) {
		return this.allFibonacci(init, undefined, n).pop();
	}
}]);