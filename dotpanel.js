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