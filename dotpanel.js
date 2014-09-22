'use strict';

angular.module('dot-panel', ['dances'])
.directive('dotPanel', ['$timeout', 'dances', function(timeout, service) {
	var panel,
		lastN = 0,
		borderWidth = 0, // px, must match css
		hidingTransitionTime = 300, //ms, must match css
		promises = [];

	// Runs 'action', 'time' milliseconds from now.
	// N is the number of a dot, to make sure each dot has only one function queued up.
	function defer(n, action, time) {
		if (promises[n]) 
			timeout.cancel(promises[n]);
		return promises[n] = timeout(action, time);
	}

	// Works out a reasonable delay for n things to happen at.
	function getDelay(delayOptions, n) {
		return Math.max(Math.min(delayOptions.step, delayOptions.maxTotal / n), delayOptions.minStep);
	}

	// Hides a dot.
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

	// Hides a dot in the future.
	function delayHide(n, el, d) {
		return defer(n, function() {
			var el = angular.element(document.getElementById('dot-' + n));
			if (el.length) {
				var size = parseInt(el.css('line-height'), 10) * 0.5;
				hide(el, parseInt(el.css('left'), 10) + size, parseInt(el.css('top'), 10) + size);
				defer(n, function() {
					el.remove();
				}, hidingTransitionTime);
			}
		}, d).then(function() {
			// Once the dot has vanished, check to see if there are a load of hidden dots not scheduled to appear.
			// The system runs slowly when you put in high numbers, and this makes it fast again when you're done.
			for (var x = promises.length - 1; promises[x] === undefined; --x);
			promises.length = x;
		});
	};

	// remove all dots with an index of n or above
	function hideDotsFrom(n) {
		var d = 0,
			dStep = getDelay(options.hideDelay, lastN - n);
		for (; n < promises.length; ++n) {
			delayHide(n, d);
			d += dStep;
		}
		lastN = n;
	}
	// This hides everything when you hit 'update'. Everything hidden is a good safe state.
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
		promises[n] = timeout(function() {
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
		defer(i, function() {
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
			var handler = function(d) {
				var h = panel.prop('clientHeight'), 
					w = panel.prop('clientWidth');
				if (h * w) {
					if (d)
						dance(service.squeezeDance(d, h, w));
					else
						dance([]);
				} else timeout(function() { handler(d); });
			};
			scope.$watch('dance', handler);
		}
	};
}]);