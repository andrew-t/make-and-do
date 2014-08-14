'use strict';
// look up sass from http://codepen.io/thebabydino/pen/IdJCi

var options = {
	maxN: 1000,
	centred: [/*5, 7*/],
	generalised: [3, 4, 5, 6],
	delayStep: 50, // ms
	showNumbers: false,
	indexFrom: 1,
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

	// make a dance comprised of N sub-dances
	function sumDances(ds) {
		var d = [], i, j;
		for (i = 0; i < ds.length; ++i)
			squeezeDance(ds[i], 1, 1);
		for (i = 1; i < ds.length; ++i)
			for (j = 0; j < ds[i].length; ++j) {
				ds[i][j].x += options.sumDistance;
				d.push(ds[i][j]);
			}
		return d;
	}

	// make sure a dance fits in the panel
	function squeezeDance(d, h, w) {
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
		var dh = maxy - miny,
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
			scope.dance = property.dance();
		};
	}])
	.directive('dotPanel', ['$timeout', 'dotService', function(timeout, service) {

		var panel,
			hidingTransitionTime = 300; //ms, must match css

		function delayHide(el, d) {
			return timeout(function() {
				el.addClass('hiding');
				timeout(function() {
					el.remove();
				}, hidingTransitionTime);
			}, d);
		};

		// remove all dots with an index of n or above
		function hideDotsFrom(n) {
			var d = 0;
			for (; n < options.maxN; ++n) {
				var el = angular.element(document.getElementById('dot-' + n));
				if (el.length) {
					delayHide(el, d);
					d += options.delayStep;
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
				if (options.showNumbers)
					el.text(n + options.indexFrom);
				panel.append(angular.element(el));
			}	
			el.style.top = y + 'px';
			el.style.left = x + 'px';
			el.style.width = el.style.height = size + 'px';
			timeout(function() {
				el.classList.remove('hiding');
			});
		}

		function delayPut(i, x, y, size, delay) {
			return timeout(function() {
				putDot(i, x, y, size);
			}, delay);
		}

		// perform a dance
		function dance(d) {
			hideDotsFrom(d.length);
			var delay = 0;
			for (var i = 0; i < d.length; ++i) {
				delayPut(i, d[i].x, d[i].y, d[i].size, delay);
				delay += options.delayStep;
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
						dance(squeezeDance(d, panel.prop('clientHeight'), panel.prop('clientWidth') ));
					else
						dance([]);
				});
			}
		};
	}]);
})();