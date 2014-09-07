'use strict';

angular.module('parseNumbers', [])
.service('parseNumbers', function() {
	// This is a helper function used in converting between ASCII or Unicode and numbers.
	return function(value, radix, digits, max) {
		var numbers = [];
		if (!value)
			return numbers;
		value = value.split(/[^0-9a-fA-F]+/);
		for (var i = 0; i < value.length; ++i) {
			if (digits && value[i].length != digits)
				return;
			var number = parseInt(value[i], radix);
			if (number < 1 || number > max)
				return;
			numbers.push(number);
		}
		return numbers;
	};
});