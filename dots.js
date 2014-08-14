'use strict';
// look up sass from http://codepen.io/thebabydino/pen/IdJCi

var options = {
	maxN: 1000,
	centred: [/*5, 7*/],
	generalised: [3, 4, 5, 6],
	totalDelay: 500, // ms
	showNumbers: false,
	margin: 0.5,
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
	.directive('dotPanel', ['$timeout', function(timeout) {
		var panel,
			hidingTransitionTime = 300; //ms, must match css

		// remove all dots with an index of n or above
		function hideDotsFrom(n) {
			var d = 0, dStep = options.totalDelay / options.maxN;
			for (; n < options.maxN; ++n) {
				var el = angular.element(document.getElementById('dot-' + n));
				if (el) {
					timeout(function() {
						el.addClass('hiding');
						timeout(function() {
							el.remove();
						}, hidingTransitionTime);
					}, d);
					d += dStep;
				}
			}
		}

		// make sure a dot exists and is in the right place
		function putDot(n, x, y, size) {
			var id = 'dot-' + n,
				el = document.getElementById(id);
			if (!el) {
				el = document.createElement('div');
				el.classList.add('dot');
				el.classList.add('hiding');
				el.id = id;
				panel.append(angular.element(el));
			}	
			el.style.top = x + 'px';
			el.style.left = y + 'px';
			el.style.width = el.style.height = size + 'px';
			return timeout(function() {
				el.classList.remove('hiding');
			});
		}

		function delayPut(i, x, y, size, delay) {
			timeout(function() {
				putDot(i, x, y, size);
			}, delay);
		}

		// perform a dance
		function dance(d) {
			hideDotsFrom(d.length);
			var delay = 0, dStep = options.totalDelay / options.maxN;
			for (var i = 0; i < d.length; ++i) {
				delayPut(i, d[i].x, d[i].y, d.size, delay);
				delay += dStep;
			}
		}

		// make a dance comprised of N sub-dances
		function sumDances(ds) {
			var d = [], i, j;
			for (i = 0; i < ds.length; ++i)
				squeezeDance(ds[i]);
			for (i = 1; i < ds.length; ++i)
				for (j = 0; j < ds[i].length; ++j) {
					ds[i][j].x += options.sumDistance;
					d.push(ds[i][j]);
				}
			d.size = d[0].size;
			return squeezeDance(d);
		}

		// make sure a dance fits in the panel
		function squeezeDance(d) {
			var minx = Infinity, 
				maxx = -Infinity,
				miny = Infinity,
				maxy = -Infinity,
				margin = d.size + options.margin;
			for (var i = 0; i < d.length; ++i) {
				if (d[i].x < minx) minx = d[i].x;
				if (d[i].x > maxx) maxx = d[i].x;
				if (d[i].y < miny) miny = d[i].y;
				if (d[i].y > maxy) maxy = d[i].y;
			};
			maxx += margin;
			minx -= margin;
			maxy += margin;
			miny -= margin;
			var h = panel.prop('clientHeight'),
				w = panel.prop('clientWidth'),
				dh = maxy - miny,
				dw = maxx - minx,
				m = Math.min(h / dh, w / dw);
				// TODO - this top-lefts it and it should centre
			for (var i = 0; i < d.length; ++i) {
				d[i].x = m * d[i].x - minx;
				d[i].y = m * d[i].y - miny;
			}
			d.size = d.size * m;
			return d;
		}

		return {
			scope: {
				dance: '='
			},
			link: function(scope, element, attrs) {
				panel = element;
				update = scope.$apply;
				scope.squeezeDance = squeezeDance;
				scope.sumDances = sumDances;
				var nullDance = [];
				nullDance.size = 0;
				scope.$watch('dance', function(d) {
					if (d)
						dance(d);
					else
						dance(nullDance);
				});
			}
		};
	}]);
})();