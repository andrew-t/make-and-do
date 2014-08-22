'use strict';

angular.module('unicode', ['parseNumbers'])
.controller('unicode', ['$scope', 'parseNumbers', function(scope, parseNumbers) {
	function setDecimal(numbers) {
		scope.decimal = numbers.map(function(number) {
			return number.toString(10);
		}).join(' ');
	}
	function setUnicode(numbers) {
		scope.unicode = String.fromCharCode.apply(null, numbers);
	}
	// TODO - check upper limit on unicode
	var unicodeMax = 0xfeffff;
	scope.$watch('decimal', function(value) {
		var numbers = parseNumbers(value, 10, undefined, unicodeMax);
		if (!(scope.decimalInvalid = !numbers)) {
			setUnicode(numbers);
		}
	});
	scope.$watch('unicode', function(value) {
		var numbers = [];
		scope.unicodeInvalid = false;
		if (value)
			for (var i = 0; i < value.length; ++i) {
				var number = value.charCodeAt(i);
				// TODO - check upper limit on unicode
				if (number < 1 || number > unicodeMax) {
					scope.unicodeInvalid = true;
					return;
				}
				numbers.push(number);
			}
		setDecimal(numbers);
	});
}]);