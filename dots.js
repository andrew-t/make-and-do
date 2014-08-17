'use strict';

(function(){
	angular.module('dots', ['prime', 'polygon', 'dances'])
	.controller('dotControls', ['$scope', 'factorise', 'dotService', 'polygon', 
		function(scope, factorise, service, polygonService) {
			scope.th = function(n) {
				if (!n) return '';
				switch (n.toString(10).replace(/^.*(\d)$/, '$1')) {
					case '1': return 'st'; break;
					case '2': return 'nd'; break;
					case '3': return 'rd'; break;
					default: return 'th'; break;
				}
			}
			function namePolygon(n, m, adjective) {
				if (n) {
					n++;
					if (m == 4)
						return n + '\u00b2';
					if (n) n += scope.th(n);
				}
				switch (m) {
					case 3: m = 'triangular'; break;
					case 4: m = 'square'; break;
					case 5: m = 'pentagonal'; break;
					case 6: m = 'hexagonal'; break;
					case 7: m = 'heptagonal'; break;
					case 8: m = 'octagonal'; break;
					case 9: m = 'nonagonal'; break;
					case 10: m = 'decagonal'; break;
					case 12: m = 'dodecagonal'; break;
					default: m += '-gonal'; break;
				}
				return (n ? 'The ' + n + ' ' : '') + adjective + ' ' + m + ' number';
			}
			var properties;
			function generateProperties() {
				// IDEAS: Factorials, perfect numbers
				properties = [
					{
						test: function(n) {
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
						}
					}, {
						test: function(n) {
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
					}, {
						test: function(n) {
							var results = [],
								limit = Math.pow(n / 2, 1 / 3) + 1;
							for (var i = 1; i <= limit; ++i) {
								var rest = n - i * i * i,
									root = Math.round(Math.pow(rest, 1 / 3));
								if (root > i && root * root * root == rest)
									results.push((function(i, root) { return {
										name: i + '\u00b3 + ' + root + '\u00b3',
										class: 'sum-of-two-cubes',
										dance: function() {
											return service.sumDances([
												service.cubeDance(i),
												service.cubeDance(root)
											]);
										}
									}})(i, root));
							}
							return results;
						}
					}
				];
				options.generalised.forEach(function(m) {
					var values = [];
					while (true) {
						var next = polygonService.generalised(values.length, m);
						if (next > options.maxN) break;
						values.push(next);
					}
					properties.push({
						name: namePolygon(undefined, m, 'generalised'),
						generate: function(n) {
							return polygonService.generalised(n, m);
						},
						test: function(n) {
							var root = values.indexOf(n);
							if (~root)
								return {
									name: namePolygon(root, m, 'generalised'),
									class: ['generalised', 'generalised-' + m],
									dance: function() {
										var d = [];
										for (var i = 0; i <= root; ++i)
											d = d.concat(service.polygonDance(m, i, undefined, 1, m - 1, 0));
										return d;
									}
								};
						}
					});
				});
				options.centred.forEach(function(m) {
					var values = [];
					while (true) {
						var next = polygonService.centred(values.length, m);
						if (next > options.maxN) break;
						values.push(next);
					}
					properties.push({
						name: namePolygon(undefined, m, 'centred'),
						generate: function(n) {
							return polygonService.centred(n, m);
						},
						test: function(n) {
							var root = values.indexOf(n);
							return ~root ? {
								name: namePolygon(root, m, 'centred'),
								class: ['centred', 'centred-' + m],
								dance: function() {
									var d = [];
									for (var i = 0; i <= root; ++i)
										d = d.concat(service.polygonDance(m, i));
									return d;
								}
							} : undefined;
						}
					});
				});
				if (options.cubes)
					properties.push({
						name: 'cube number',
						generate: function(n) {
							return n * n * n;
						},
						test: function(n) {
							// rounding errors, so dick about a little:
							var root = Math.round(Math.pow(n, 1/3));
							if (root * root * root == n)
								return {
									name: root + '\u00b3',
									class: 'cube',
									dance: function() {
										return service.cubeDance(root);
									}
								};
						}
					});
				scope.namedProperties = [];
				properties.forEach(function(property) {
					if (property.name)
						scope.namedProperties.push(property.name);
				});
			}
			update.hooks.push(generateProperties);
			generateProperties();
			scope.$watch('n', function(n) {
				if (n < 0 && n > options.maxN) {
					scope.properties = [];
					return;
				}
				var props = [];
				for (var i = 0; i < properties.length; ++i) {
					var property = properties[i].test(n);
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
			scope.get = function(name, n) {
				properties.forEach(function(property) {
					if (property.name == name) {
						var m = property.generate(n);
						if (m > 0 && m <= options.maxN) {
							scope.n = m;
							scope.dance = property.test(m).dance();
						} else {
							console.log(m + ' is out of range.')
						}
					}
				});
			}
		}])
	.directive('dotPanel', ['$timeout', 'dotService', function(timeout, service) {

		var panel,
			lastN = 0,
			borderWidth = 2, // px, must match css
			hidingTransitionTime = 300; //ms, must match css

		function getDelay(params, n) {
			return Math.max(Math.min(params.step, params.maxTotal / n), params.minStep);
		}

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
			var d = 0,
				dStep = getDelay(options.hideDelay, lastN - n);
			for (; n < options.maxN; ++n) {
				var el = angular.element(document.getElementById('dot-' + n));
				if (el.length) {
					delayHide(el, d);
					d += dStep;
				}
			}
			lastN = n;
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
				el.style.background = service.getBg(n);
				el.style.top = y + 'px';
				el.style.left = x + 'px';
				el.style['line-height'] = el.style.width = el.style.height = '0';
				el.style['font-size'] = '0';
				el.id = id;
				var ael = angular.element(el);
				ael.addClass('dot');
				ael.addClass('hiding');
				if (options.showNumbers)
					ael.text(n + options.indexFrom);
				panel.append(ael);
			}
			// todo - replace with css animation?
			timeout(function() {
				(ael || angular.element(el)).removeClass('hiding');
				el.style.top = (y - size * 0.5) + 'px';
				el.style.left = (x - size * 0.5) + 'px';
				el.style['line-height'] = size - borderWidth + 'px';
				el.style.width = el.style.height = size + 'px';
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
			var delay = 0, dStep = getDelay(options.appearDelay, d.length);
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