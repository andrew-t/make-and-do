'use strict';

angular.module('ascii', [])
.controller('ascii', ['$scope', function(scope) {
	function setDecimal(numbers) {
		scope.decimal = numbers.map(function(number) {
			return number.toString(10);
		}).join(' ');
	}
	function setBinary(numbers) {
		scope.binary = numbers.map(function(number) {
			var bin = number.toString(2);
			return '00000000'.substr(0, 8 - bin.length) + bin;
		}).join('\n');
	}
	function setHex(numbers) {
		scope.hex = numbers.map(function(number) {
			return (number < 0xf ? '0' : '') + number.toString(16);
		}).join('');
	}
	function setAscii(numbers) {
		scope.ascii = String.fromCharCode.apply(null, numbers);
	}
	function parseNumbers(value, radix, digits) {
		var numbers = [];
		if (!value)
			return numbers;
		value = value.split(/[^0-9a-fA-F]+/);
		for (var i = 0; i < value.length; ++i) {
			if (digits && value[i].length != digits)
				return;
			var number = parseInt(value[i], radix);
			if (number < 1 || number > 127)
				return;
			numbers.push(number);
		}
		return numbers;
	}
	scope.$watch('binary', function(value) {
		var numbers = parseNumbers(value, 2, 8);
		if (!(scope.binaryInvalid = !numbers)) {
			setAscii(numbers);
			setDecimal(numbers);
			setHex(numbers);
		}
	});
	scope.$watch('decimal', function(value) {
		var numbers = parseNumbers(value, 10);
		if (!(scope.decimalInvalid = !numbers)) {
			setAscii(numbers);
			setBinary(numbers);
			setHex(numbers);
		}
	});
	scope.$watch('hex', function(value) {
		var numbers = [];
		if (value) {
			if (scope.hexInvalid = value.length & 1)
				return;
			value = value.replace(/\s/, '');
			for (var i = 0; i < value.length; i += 2) {
				var number = parseInt(value.substr(i, 2), 16);
				if (number < 1 || number > 127) {
					scope.hexInvalid = true;
					return;
				}
				numbers.push(number);
			}
		}
		if (!(scope.decimalInvalid = !numbers)) {
			setAscii(numbers);
			setBinary(numbers);
			setDecimal(numbers);
		}
	});
	scope.$watch('ascii', function(value) {
		var numbers = [];
		scope.asciiInvalid = false;
		if (value)
			for (var i = 0; i < value.length; ++i) {
				var number = value.charCodeAt(i);
				if (number < 1 || number > 127) {
					scope.asciiInvalid = true;
					return;
				}
				numbers.push(number);
			}
		setDecimal(numbers);
		setBinary(numbers);
		setHex(numbers);
	});
}]);