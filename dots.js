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

	var panel,
		hidingTransitionTime = 300; //ms, must match css

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
		return squeezeDance(d);
	}

	// make sure a dance fits in the panel
	function squeezeDance(d) {
		var minx = Infinity, 
			maxx = -Infinity,
			miny = Infinity,
			maxy = -Infinity,
			maxSize = -Infinity;
		for (var i = 0; i < d.length; ++i) {
			if (d[i].x < minx) minx = d[i].x;
			if (d[i].x > maxx) maxx = d[i].x;
			if (d[i].y < miny) miny = d[i].y;
			if (d[i].y > maxy) maxy = d[i].y;
			if (d[i].size > maxSize) maxSize = d[i].size;
		};
		var	margin = maxSize + options.margin
		maxx += margin;
		minx -= margin;
		maxy += margin;
		miny -= margin;
		var h = panel.prop('clientHeight'),
			w = panel.prop('clientWidth'),
			dh = maxy - miny,
			dw = maxx - minx,
			m = Math.min(h / dh, w / dw),
			cx = (w - m * dw) * 0.5,
			cy = (h - m * dh) * 0.5;
		for (var i = 0; i < d.length; ++i) {
			d[i].x = m * d[i].x + cx;
			d[i].y = m * d[i].y + cy;
			d[i].size = d[i].size * m;
		}
		return d;
	}

	angular.module('dots', ['prime'])
	.service('dotService', function() {
		// hidden maths!!
		var phi = (1 + Math.sqrt(5)) / 2,
			hueStep = 360 * phi;
		this.getBg = function(i) {
			return 'hsl(' + (hueStep * i) + ', 50%, 50%)';
		};
	})
	.controller('dotControls', ['$scope', 'factorise', function(scope, factorise) {
		var properties = [
			function(n) {
				var factors = factorise.factorise(n);
				return (n < 2 || factors.length) ? undefined : {
					name: 'Prime',
					dance: function() {
						var d = [];
						for (var i = 0; i < n; ++i)
							d.push({
								x: i,
								y: (i % 2) * 0.5,
								size: 1
							});
						return d;
					}
				};
			},
			function(n) {
				var root = Math.sqrt(n);
				return (root % 1) ? undefined : {
					name: root + ' squared',
					dance: function() {
						var d = [];
						for (var y = 0; y < root; ++y)
							for (var x = 0; x < root; ++x)
								d.push({
									x: x,
									y: y,
									size: 0.9
								});
						return d;
					}
				};
			}
		];
		scope.$watch('n', function(n) {
			var props = [];
			for (var i = 0; i < properties.length; ++i) {
				var property = properties[i](n);
				if (property) props.push(property);
			}
			scope.properties = props;
		});
		scope.showProperty = function(property) {
			scope.dance = squeezeDance(property.dance());
		};
	}])
	.directive('dotPanel', ['$timeout', 'dotService', function(timeout, service) {

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
				el.style.background = service.getBg(n);
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
				delayPut(i, d[i].x, d[i].y, d[i].size, delay);
				delay += dStep;
			}
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
				scope.$watch('dance', function(d) {
					if (d)
						dance(d);
					else
						dance([]);
				});
			}
		};
	}]);
})();