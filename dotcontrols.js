'use strict';

angular.module('dot-controls', ['th', 'dances', 'properties'])
.controller('dotControls', ['$scope', 'dances', 'th', '$timeout', 'properties',
	function(scope, service, th, timeout, getProperties) {
		scope.th = th;
		function hash(n, property) {
			return '#' + n + '-' + property.stub;
		}
		var properties;
		function generateProperties() {
			properties = getProperties();
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