'use strict';

angular.module('properties', ['prime', 'polygon', 'dances', 'fibonacci'])
.service('properties', ['factorise', 'dances', 'polygon', 'fibonacci',
	function(factorise, service, polygonService, fibonacci) {
		return function() {
			// IDEAS: Factorials, perfect numbers
			var properties = [
				{
					test: function(n) {
						var factors = factorise.factorise(n);
						switch (factors.length) {
							case 1:
								var m = n.toString(2).length - 1;
								return {
									name: n &-~ n ? 'Prime' : 'Mersenne prime',
									class: ['prime'],
									stub: 'prime',
									dance: function() {
										return service.polygonDance(n);
									}
								};
							case 2:
								return {
									name: 'Semiprime (' + factors[0] + ' \u00d7 ' + factors[1] + ')',
									class: ['semiprime'],
									stub: 'semiprime',
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
				}
			];
			options.generalised.forEach(function(m) {
				var values = [];
				while (true) {
					var next = polygonService.generalised(values.length + 1, m);
					if (next > options.maxN) break;
					values.push(next);
				}
				properties.push({
					name: polygonService.name(undefined, m, 'generalised'),
					generate: function(n) {
						return polygonService.generalised(n, m);
					},
					test: function(n) {
						var root = values.indexOf(n);
						if (~root)
							return {
								name: polygonService.name(root, m, 'generalised'),
								class: ['generalised', 'generalised-' + m],
								stub: 'generalised-' + m,
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
					name: polygonService.name(undefined, m, 'centred'),
					generate: function(n) {
						return polygonService.centred(n - 1, m);
					},
					test: function(n) {
						var root = values.indexOf(n);
						return ~root ? {
							name: polygonService.name(root, m, 'centred'),
							class: ['centred', 'centred-' + m],
							stub: 'centred-' + m,
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
			options.fibonacci.forEach(function(init) {
				var values = fibonacci.allFibonacci(init, options.maxN),
					property = {
						test: function(n) {
							var root = values.indexOf(n);
							return ~root ? {
								name: fibonacci.name(root + 1, init),
								class: ['fibonacci', 'fibonacci-' + init.join('-')],
								stub: 'fibonacci-' + init.join('-'),
								dance: function() {
									// TODOOOO
									return service.polygonDance(n);
								}
							} : undefined;
						}
					};
				if (init.length == 2 && init[0] == 1 && init[1] == 1) {
					property.generate = function(n) {
						return fibonacci.fibonacci(init, n);
					};
					property.name = 'Fibonacci number';
				}
				properties.push(property);
			});
			if (options.cubes) {
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
				properties.push({
					test: function(n) {
						var results = [],
							limit = Math.pow(n / 2, 1 / 3) + 1;
						for (var i = 1; i <= limit; ++i) {
							var rest = n - i * i * i,
								root = Math.round(Math.pow(rest, 1 / 3));
							if (root >= i && root * root * root == rest)
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
				});
			}
			return properties
		};
	}]);