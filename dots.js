'use strict';

(function(){
	angular.module('dots', ['prime'])
	.service('dotService', function() {
		// hidden maths!!
		var phi = (1 + Math.sqrt(5)) / 2,
			hueStep = 360 * phi;
		this.getBg = function(i) {
			return 'hsl(' + (hueStep * i) + ', 50%, 50%)';
		};

		// make a dance comprised of N sub-dances
		this.sumDances = function(ds) {
			var d = [], i, j;
			for (i = 0; i < ds.length; ++i)
				squeezeDance(ds[i], 1, 1);
			for (i = 1; i < ds.length; ++i)
				for (j = 0; j < ds[i].length; ++j) {
					ds[i][j].x += options.sumDistance;
					d.push(ds[i][j]);
				}
			return d;
		};

		// make sure a dance fits in the panel
		this.squeezeDance = function(d, h, w) {
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
				cx = -m * minx, // TODO - this top-lefts it
				cy = -m * miny;
			for (var i = 0; i < d.length; ++i) {
				d[i].x = m * d[i].x + cx;
				d[i].y = m * d[i].y + cy;
				d[i].size = d[i].size * m;
			}
			return d;
		};

		this.polygonDance = function(sides, perSide, radius, firstSide, lastSide) {
			if (perSide === undefined)
				perSide = 1;
			if (firstSide === undefined) 
				firstSide = 0;
			else
				firstSide %= sides;
			if (lastSide === undefined)
				lastSide = sides - 1; 
			else
				lastSide %= sides;
			var corners = [], theta = Math.PI * 2 / sides, i;
			// more hidden maths!!
			if (!radius)
				radius = options.polygonSpacing * 0.5 * perSide / 
					Math.cos((Math.PI - theta) * 0.5);
			for (i = 0; i < sides; ++i)
				corners.push({
					x: Math.sin(theta * i) * radius,
					y: Math.cos(theta * i) * radius,
					size: 0.5
				});
			if (perSide == 1)
				return corners;
			var d = [], i = firstSide;
			i = firstSide;
			do {
				var a = corners[i], b = corners[i = (i + 1) % sides];
				for (var j = 0; j < perSide; ++j) {
					var bb = j / perSide, aa = 1 - x;
					d.push({
						x: a.x * aa + b.x * bb,
						y: a.y * aa + b.y * bb,
						size: a.size * aa + b.size * bb
					});
				}
			} while (i != lastSide);
			if (((lastSide + 1) % sides) != firstSide)
				d.push(corners[lastSide]);
			return d;
		};
	})
	.controller('dotControls', ['$scope', 'factorise', 'dotService', 
		function(scope, factorise, service) {
			var properties = [
				function(n) {
					var factors = factorise.factorise(n);
					switch (factors.length) {
						case 1:
							return {
								name: 'Prime',
								dance: function() {
									return service.polygonDance(n);
								}
							};
						case 2:
							return {
								name: 'Coprime',
								dance: function() {
									var d = [], size = 0.5 / options.polygonSpacing;
									for (var y = 0; y < factors[0]; ++y)
										for (var x = 0; x < factors[1]; ++x)
											d.push({ x: x, y: y, size: size });
									return d;
								}
							};
					}
				},
				function(n) {
					var root = Math.sqrt(n);
					return (root % 1) ? undefined : {
						name: root + ' squared',
						dance: function() {
							var d = [];
							// TODO - use polygon
							for (var y = 0; y < root; ++y)
								for (var x = 0; x < root; ++x)
									d.push({ x: x, y: y, size: 0.9 });
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
				if (props.length == 0) {
					props.push({
						name: n,
						dance: function() {
							return service.polygonDance(n);
						}});
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
			el.style.top = (y - size * 0.5) + 'px';
			el.style.left = (x - size * 0.5) + 'px';
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
				scope.squeezeDance = service.squeezeDance;
				scope.sumDances = service.sumDances;
				scope.$watch('dance', function(d) {
					if (d)
						dance(service.squeezeDance(d, panel.prop('clientHeight'), panel.prop('clientWidth') ));
					else
						dance([]);
				});
			}
		};
	}]);
})();