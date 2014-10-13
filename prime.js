'use strict';

angular.module('prime', ['factorise'])
.directive('prime', ['factorise', '$timeout', function(factorise, timeout) {
	// rofl lol its the prime directive hahahaha
	return {
		scope: {
			n: '=',
			processing: '='
		},
		template: '{{result}} <button ng-if="slow" ng-click="startSlow(n)">Calculate</button>',
		link: function(scope, element, attrs) {
			var hideButton = false;
			// Note: some (terrible) browsers don't support Web Workers
			// (little Javascript robots that do background calculations without locking the UI)
			// so detect if they are supported and if not then just don't accept numbers over a billion.
			var worker = self.Worker && new Worker('primeworker.js');
			if (worker) {
				// You have to post a message to the worker to fire it up.
				// Not sure that matters here but it's good practice. Probably.
				worker.postMessage('');
				worker.addEventListener('message', function(e) {
					scope.$apply(function() {
						// The worker might return an error, a partial list of factors,
						// or a full list of factors.
						if (e.data.error)
							scope.result = 'Error: ' + e.data.error;
						else if (e.data.done)
							scope.result = e.data.error || 
								(scope.n + (e.data.factors.length > 1
									? ' = ' + e.data.factors.join(' \u00d7 ')
									: ' is prime'));
						else
							scope.result = scope.n + ' = ' + e.data.factors.join(' \u00d7 ') + ' \u00d7 \u2026';
						scope.processing = !e.data.done;
					});
				});
			}
			scope.startSlow = function(n) {
				if (worker) {
					worker.postMessage(n.toFixed(10));
					scope.result = '';
					scope.slow = false;
					scope.processing = true;
				}
			};
			function useSlow(n) {
				return n.gt(1000000000);
			}
			scope.$watch('n', function(n) {
				if (!n) {
					scope.result = '';
					scope.slow = false;
				} else if (n.lt(2)) {
					scope.result = n + ' is too small';
					scope.slow = false;
				} else if (useSlow(n)) { 
					scope.result = '';
					// scope.slow tells the page if it should show the 'calculate...' button.
					// In this case, we should only show it if the worker exists.
					// Because good practice, we coerce worker to be a boolean, using 'not not'.
					// This is nonsense mathematically, but Javascript so often is.
					scope.slow = !!worker;
					if (hideButton)
						scope.slow = 
						hideButton = false;
				} else {
					scope.slow = false;
					var factors = factorise.factoriseBig(n);
					scope.result = n + (factors.length > 1
						? ' = ' + factors.map(function(f) {
								return f.toFixed(0);
							}).join(' \u00d7 ')
						: ' is prime');
				}
			});
			// load from URL
			if (window.location.hash) {
				scope.n = new Big(window.location.hash.substr(1));
				if (useSlow(scope.n)) {
					scope.startSlow(scope.n);
					hideButton = true;
				}
				// This is a bit of a hack, but fixing it properly at this stage would be tricky:
				timeout(function() {
					var bigScope = angular.element(document.querySelector('[big]'))
									   .isolateScope();
					bigScope.$apply(function() {
						bigScope.raw = scope.n.toString();
					});
				});
			}
		}
	};
}]);