'use strict';
// look up sass from http://codepen.io/thebabydino/pen/IdJCi

var options = {
	maxN: 1000,
	centred: [/*5, 7*/],
	generalised: [3, 4, 5, 6],
	totalDelay: 500, // ms
	showNumbers: false
};

console.log('Hello! Since you\'ve opened the dev console on a mathsy site, I assume ' +
	'you\re my kind of person, so I\m going to tell you a secret: I have done a naughty ' +
	'thing and put all the settings on the global scope so you can play with them. ' +
	'the object is called `options`, so feel free to play with it and see what happens. ' +
	'Call `update()` once you\'re finished to refresh the view.');

console.log('Keys in `options`:');
console.log(Object.keys(options));

(function(){
	angular.module('dots', [])
	.directive('dotpanel', ['$timeout', function(timeout) {
		var panel,
			hidingTransitionTime = 300; //ms

		function hideDotsFrom(n) {
			var d = 0, dStep = options.totalDelay / options.maxN;
			for (; n < maxN; ++n) {
				var el = document.getElementById('dot-' + n);
				if (el) {
					timeout(function() {
						el.classList.add('hiding');
						timeout(function() {
							panel.removeChild(el);
						}, hidingTransitionTime);
					}, d);
					d += dStep;
				}
			}
		}

		function putDotAt(n, x, y, size) {
			var el = document.getElementById('dot-' + n);
			if (el) {
				// TODO
			} else {
				// TODO
			}
		}

		return {
			scope: {

			},
			link: function(scope, element, attrs) {
				panel = element;
			}
		};
	}]);
})();