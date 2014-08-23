'use strict';

angular.module('dot-controls', ['prime', 'polygon', 'dances'])
.controller('dotControls', ['$scope', 'factorise', 'dances', 'polygon', '$timeout', 
	function(scope, factorise, service, polygonService, timeout) {
		scope.th = function(n) {
			if (!n)
				return '';
			if (n >= 10 && n <= 20)
				return 'th';
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
			var mgonal;
			switch (m) {
				case 3: mgonal = 'triangular'; break;
				case 4: mgonal = 'square'; break;
				case 5: mgonal = 'pentagonal'; break;
				case 6: mgonal = 'hexagonal'; break;
				case 7: mgonal = 'heptagonal'; break;
				case 8: mgonal = 'octagonal'; break;
				case 9: mgonal = 'nonagonal'; break;
				case 10: mgonal = 'decagonal'; break;
				case 12: mgonal = 'dodecagonal'; break;
				default: mgonal += '-gonal'; break;
			}
			return ((n ? 'The ' + n + ' ' : '') +
				(((adjective == 'generalised') && (m == 3 || m == 4)) ||
					((adjective == 'centred') && (m == 6))
						? '' : (adjective + ' ')) + 
				mgonal + ' number');
		}
		function hash(n, property) {
			return '#' + n + '-' + property.stub;
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
								var m = n.toString(2).length - 1;
								return {
									name: n &-~ n ? 'Prime' : (m + scope.th(m) + ' Mersenne prime'),
									class: ['prime'],
									stub: 'prime',
									dance: function() {
										return service.polygonDance(n);
									}
								};
							case 2:
								return {
									name: 'Semiprime (' + factors[0] + ' \u00d7 ' + factors[1] + ')',
									class: ['coprime'],
									stub: 'coprime',
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
									stub: 'squares-' + i + '-' + root,
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
									stub: 'cubes-' + i + '-' + root,
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
								name: namePolygon(root - 1, m, 'generalised'),
								class: ['generalised', 'generalised-' + m],
								stub: 'generalised-' + m,
								dance: function() {
									var d = [];
									for (var i = 0; i < root; ++i)
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
							name: namePolygon(root - 1, m, 'centred'),
							class: ['centred', 'centred-' + m],
							stub: 'centred-' + m,
							dance: function() {
								var d = [];
								for (var i = 0; i < root; ++i)
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
								stub: 'cube',
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
		var autoArrange, danceStub;
		scope.$watch('n', function(n) {
			if (n < 0 || n > options.maxN) {
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
					class: 'boring-number',
					stub: 'n',
					dance: function() {
						return service.polygonDance(n);
					}});
			}
			scope.properties = props;
			if (autoArrange)
				timeout.cancel(autoArrange);
			if (danceStub)
				for (var i = 0; i < props.length ; ++i)
					if (props[i].stub == danceStub) {
						scope.showProperty(props[i]);
						return;
					}
			autoArrange = timeout(function() {
				scope.$apply(function() {
					scope.hash = hash(scope.n, props[0]);
					scope.dance = props[0].dance();
				});
			}, options.autoArrangeDelay);
		});
		scope.showProperty = function(property) {
			if (autoArrange)
				timeout.cancel(autoArrange);
			scope.hash = hash(scope.n, property);
			scope.dance = property.dance();
		};
		scope.get = function(name, n) {
			properties.forEach(function(property) {
				if (property.name == name) {
					scope.n = property.generate(n);
					if (scope.n > 0 && scope.n <= options.maxN)
						danceStub = property.test(scope.n).stub;
				}
			});
		}
		// Read from URL
		if (window.location.hash) {
			var i = window.location.hash.indexOf('-');
			if (~i) {
				scope.n = parseInt(window.location.hash.substr(1, i - 1), 10);
				danceStub = window.location.hash.substr(i + 1);
			}
		} else scope.n = 1;
	}]);