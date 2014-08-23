'use strict';

angular.module('dot-panel', ['dances'])
.directive('dotPanel', ['$timeout', 'dances', function(timeout, service) {
	var panel,
		lastN = 0,
		borderWidth = 2, // px, must match css
		hidingTransitionTime = 300; //ms, must match css

	function getDelay(params, n) {
		return Math.max(Math.min(params.step, params.maxTotal / n), params.minStep);
	}

	function hide(el, x, y) {
		el.addClass('hiding').css({
			left: x + 'px',
			top: y + 'px',
			'line-height': '0',
			width: '0',
			height: '0',
			'font-size': '0'			
		});
	}

	function delayHide(el, d) {
		return timeout(function() {
			var size = parseInt(el.css('line-height'), 10) * 0.5;
			hide(el, parseInt(el.css('left'), 10) + size, parseInt(el.css('top'), 10) + size);
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
			var el = document.getElementById('dot-' + n);
			if (el) {
				delayHide(angular.element(el), d);
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
			var ael = angular.element(el);
			ael.addClass('dot');
			hide(ael, x, y, size);
			el.id = id;
			if (options.showNumbers)
				ael.text(n + options.indexFrom);
			panel.append(ael);
		}
		// todo - replace with css animation?
		timeout(function() {
			(ael || angular.element(el)).removeClass('hiding')
				.css({
					background: service.getBg(n),
					top: (y - size * 0.5) + 'px',
					left: (x - size * 0.5)  + 'px',
					'line-height': size - borderWidth + 'px',
					'font-size': (size * options.fontSize) + 'px',
					width: size + 'px',
					height: size + 'px'
				});
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