'use strict';

var demoOptions = {
	dotSize: .8,
	margin: 2,
	rSat: false,
	debounce: 350
};

angular.module('demo', [])
.controller('demo', ['$scope', '$timeout', function(scope, timeout) {
	scope.dots = [];
	scope.n = 1000;
	scope.p = 1;
	scope.i = 0;
	scope.theta =  (1 + Math.sqrt(5)) / 2;
	var tau = Math.PI * 2,
		promise;
	function update() {
		if (promise)
			timeout.cancel(promise);
		promise = timeout(function() {
			scope.dots.length = scope.n;
			var dotRadius = demoOptions.dotSize * 50 / Math.sqrt(scope.n),
				theta = 0,
				dTheta = 1 / scope.theta,
				rFactor = 50 - demoOptions.margin - dotRadius;
			for (var i = 0; i < scope.n; ++i) {
				var relR = Math.sqrt(i / scope.n),
					r = rFactor * relR;
				scope.dots[i] = {
					i: i,
					highlight: !((i - scope.i) % scope.p),
					style: {
						background: 'hsl(' + (360 * theta) + ', ' + (demoOptions.rSat ? (relR * 100) : 75) + '%, 50%)',
						top: (Math.sin(tau * theta) * r + 50 - dotRadius) + '%',
						left: (Math.cos(tau * theta) * r + 50 - dotRadius) + '%',
						width: (dotRadius * 2) + '%',
						height: (dotRadius * 2) + '%',
						'border-radius': '100%'
					}
				};
				theta += dTheta;
			}
		}, demoOptions.debounce);
	}
	scope.$watch('n', update);
	scope.$watch('p', update);
	scope.$watch('i', update);
	scope.$watch('theta', update);
}])