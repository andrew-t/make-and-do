'use strict';
// look up sass from http://codepen.io/thebabydino/pen/IdJCi

var options = {
	maxN: 1000,
	centred: [/*5, 7*/],
	generalised: [3, 4, 5, 6],
	totalDelay: 500, // ms
	showNumbers: false,
	margin: 10,
	sumDistance: 1.2
}, update;

console.log('Hello! Since you\'ve opened the dev console on a mathsy site, I assume ' +
	'you\re my kind of person, so I\'m going to tell you a secret: I have done a naughty ' +
	'thing and put all the settings on the global scope so you can play with them. ' +
	'the object is called `options`, so feel free to play with it and see what happens. ' +
	'Call `update()` once you\'re finished to refresh the view.');

console.log('Keys in `options`:');
console.log(Object.keys(options));

(function(){
	angular.module('dots', [])
	.directive('dotpanel', ['$timeout', function(timeout) {
		var panel,
			hidingTransitionTime = 300; //ms, must match css

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

		function putDot(n, x, y, size) {
			var id = 'dot-' + n,
				el = document.getElementById(id);
			if (!el) {
				el = document.createElement('div');
				el.classList.add('dot');
				el.classList.add('hiding');
				el.id = id;
				panel.appendChild(el);
			}	
			el.style.top = x + 'px';
			el.style.bottom = y + 'px';
			el.style.width = el.style.height = size + 'px';
			return timeout(function() {
				el.classList.remove('hiding');
			});
		}

		function dance(d) {
			hideDotsFrom(d.length);
			var d = 0, dStep = options.totalDelay / options.maxN;
			for (var i = 0; i < d.length; ++i) {
				timeout(function() {
					putDot(i, d[i].x, d[i].y, d.size);
				}, d);
				d += dStep;
			}
		}

		function sumDances(ds) {
			var d = [], i, j;
			for (i = 0; i < ds.length; ++i)
				squeezeDance(ds[i]);
			for (i = 1; i < ds.length; ++i)
				for (j = 0; j < ds[i].length; ++j)
					d[i][j].x += options.sumDistance;
			// todo - compile into one dance
			return squeezeDance(d);
		}

		function squeezeDance(d) {
			var minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
			for (var i = 0; i < d.length; ++i) {
				if (d[i].x < minx) minx = d[i].x;
				if (d[i].x > maxx) maxx = d[i].x;
				if (d[i].y < miny) miny = d[i].y;
				if (d[i].y > maxy) maxy = d[i].y;
			};
			maxx += d.size + margin; minx -= d.size + margin;
			maxy += d.size + margin; miny -= d.size + margin;
			var h = panel.clientHeight, w = panel.clientWidth,
				dh = maxy - miny, dw - maxx - minx;
				m = Math.min(h / dh, w / dw),
				cx = ((minx + maxx) * m + w) * .5,
				cy = ((miny + maxy) * m + h) * .5;
			for (var i = 0; i < d.length; ++i) {
				d[i].x = m * d[i].x + cx;
				d[i].y = m * d[i].y + cy;
			}
			d.size = d.size * m;
			return d;
		}

		return {
			scope: {
				n: '='
			},
			link: function(scope, element, attrs) {
				panel = element;
				update = scope.$apply();
			}
		};
	}]);
})();