'use strict';

(function(){
	angular.module('dots', ['prime', 'polygon'])
	.service('dotService', function() {
		this.getBg = function(i) {
			return 'hsl(' + (options.hueStep * i) + ', ' + options.saturation + '%, ' + options.lightness + '%)';
		};

		// make a dance comprised of N sub-dances
		this.sumDances = function(ds) {
			var i, j;
			for (i = 0; i < ds.length; ++i)
				this.squeezeDance(ds[i], 1, 1);
			for (i = 1; i < ds.length; ++i)
				for (j = 0; j < ds[i].length; ++j) {
					ds[i][j].x += options.sumDistance;
					ds[0].push(ds[i][j]);
				}
			return ds[0];
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
				cx = 0.5 * (w - m * (minx + maxx)),
				cy = 0.5 * (h - m * (miny + maxy));
			for (var i = 0; i < d.length; ++i) {
				d[i].x = m * d[i].x + cx;
				d[i].y = m * d[i].y + cy;
				d[i].size = d[i].size * m;
			}
			return d;
		};

		this.polygonDance = function(sides, perSide, radius, firstSide, lastSide, centreOnCorner) {
			if (perSide === undefined)
				perSide = 1;
			if (firstSide === undefined) 
				firstSide = 0;
			else
				firstSide %= sides;
			if (lastSide === undefined)
				lastSide = firstSide; 
			else
				lastSide %= sides;
			var corners = [], theta = Math.PI * 2 / sides, i;
			// hidden maths!!
			if (!radius)
				radius = options.polygonSpacing * 0.5 * perSide / 
					Math.cos((Math.PI - theta) * 0.5);
			for (i = 0; i < sides; ++i)
				corners.push({
					x: -Math.sin(theta * i) * radius,
					y: -Math.cos(theta * i) * radius,
					size: 0.5
				});
			var d = [], i = firstSide;
			i = firstSide;
			function addDot(dot) {
				if (centreOnCorner !== undefined) {
					dot.x -= corners[centreOnCorner].x;
					dot.y -= corners[centreOnCorner].y;
				}
				d.push(dot);
			}
			do {
				var a = corners[i], b = corners[i = (i + 1) % sides];
				for (var j = 0; j < perSide; ++j) {
					var bb = j / perSide, 
						aa = 1 - bb;
					addDot({
						x: a.x * aa + b.x * bb,
						y: a.y * aa + b.y * bb,
						size: a.size * aa + b.size * bb
					});
				}
			} while (i != lastSide);
			if (lastSide != firstSide || perSide == 0)
				addDot(corners[lastSide]);
			return d;
		};

		this.squareDance = function(a, b) {
			if (b === undefined) b = a;
			var d = [], size = 0.5 / options.polygonSpacing;
			for (var y = 0; y < b; ++y)
				for (var x = 0; x < a; ++x)
					d.push({ x: x, y: y, size: size });
			return d;
		}
	})
	.controller('dotControls', ['$scope', 'factorise', 'dotService', 'polygon', 
		function(scope, factorise, service, polygonService) {
			var properties, generateProperties = function() {
				// IDEAS: Factorials, perfect numbers
				properties = [
					function(n) {
						var factors = factorise.factorise(n);
						switch (factors.length) {
							case 1:
								return {
									name: 'Prime',
									class: ['prime'],
									dance: function() {
										return service.polygonDance(n);
									}
								};
							case 2:
								return {
									name: 'Semiprime (' + factors[0] + ' \u00d7 ' + factors[1] + ')',
									class: ['coprime'],
									dance: function() {
										return service.squareDance(factors[1], factors[0]);
									}
								};
						}
					}, function(n) {
						var results = [],
							limit = Math.sqrt(n / 2);
						for (var i = 1; i <= limit; ++i) {
							var root = Math.sqrt(n - i * i);
							if (!(root % 1))
								results.push((function(i, root) { return {
									name: i + '\u00b2 + ' + root + '\u00b2',
									class: 'sum-of-two-squares',
									dance: function() {
										return service.sumDances([
											service.squareDance(i),
											service.squareDance(root)
										]);
									}
								}})(i, root));
						}
						return results;
					}
				];
				options.generalised.forEach(function(m) {
					var values = [];
					while (true) {
						var next = polygonService.generalised(values.length, m);
						if (next > options.maxN) break;
						values.push(next);
					}
					properties.push(function(n) {
						var root = values.indexOf(n);
						return ~root ? {
							// TODO - beter name
							name: (root + 1) + 'th generalised ' + m + '-gonal number',
							class: ['generalised', 'generalised-' + m],
							dance: function() {
								var d = [];
								for (var i = 0; i <= root; ++i)
									d = d.concat(service.polygonDance(m, i, undefined, 1, m - 1, 0));
								return d;
							}
						} : undefined;
					});
				});
				options.centred.forEach(function(m) {
					var values = [];
					while (true) {
						var next = polygonService.centred(values.length, m);
						if (next > options.maxN) break;
						values.push(next);
					}
					properties.push(function(n) {
						var root = values.indexOf(n);
						return ~root ? {
							// TODO - beter name
							name: (root + 1) + 'th centred ' + m + '-gonal number',
							class: ['centred', 'centred-' + m],
							dance: function() {
								var d = [];
								for (var i = 0; i <= root; ++i)
									d = d.concat(service.polygonDance(m, i));
								return d;
							}
						} : undefined;
					});
				});
			};
			update.hooks.push(generateProperties);
			generateProperties();
			scope.$watch('n', function(n) {
				if (n > options.maxN) {
					scope.properties = [];
					return;
				}
				var props = [];
				for (var i = 0; i < properties.length; ++i) {
					var property = properties[i](n);
					if (property) {
						if (property.dance) props.push(property);
						else if (property.length) props = props.concat(property);
					}
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
				var size = parseInt(el.css('line-height'), 10) * 0.5,
					x = parseInt(el.css('left'), 10),
					y = parseInt(el.css('top'), 10);
				el.css({
					left: (x + size) + 'px',
					top: (y + size) + 'px',
					'line-height': size + 'px',
					width: '0',
					height: '0',
					'font-size': '0'			
				});
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
					d += options.hideDelayStep;
				}
			}
		}
		update.hooks.push(function() {
			hideDotsFrom(0);
		});

		// make sure a dot exists and is in the right place
		function putDot(n, x, y, size) {
			var id = 'dot-' + n,
				el = document.getElementById(id);
			if (!el) {
				el = document.createElement('div');
				el.classList.add('dot');
				el.classList.add('hiding');
				el.style.background = service.getBg(n);
				el.style.top = y + 'px';
				el.style.left = x + 'px';
				el.style['line-height'] = el.style.width = el.style.height = '0';
				el.style['font-size'] = '0';
				el.id = id;
				var ael = angular.element(el);
				if (options.showNumbers)
					ael.text(n + options.indexFrom);
				panel.append(ael);
			}
			// todo - replace with css animation?
			timeout(function() {
				el.classList.remove('hiding');
				el.style.top = (y - size * 0.5) + 'px';
				el.style.left = (x - size * 0.5) + 'px';
				el.style['line-height'] = el.style.width = el.style.height = size + 'px';
				el.style['font-size'] = (size * options.fontSize) + 'px';
			}, options.preTransitionDelay);
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
				scope.squeezeDance = service.squeezeDance;
				scope.sumDances = service.sumDances;
				scope.$watch('dance', function(d) {
					if (d)
						dance(service.squeezeDance(d, 
							panel.prop('clientHeight'), panel.prop('clientWidth')));
					else
						dance([]);
				});
			}
		};
	}]);
})();