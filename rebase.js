'use strict';

angular.module('rebase', [])
.service('baseConverter', function() {
	var self = this;
	self.digits = '0123456789abcdefghijklmnopqrstuvwxyz';
	self.fromDigits = function(digitArray, base) {
		var longhand = base > self.digits.length;
		function get(n) {
			return longhand ? n.toString() + ':' : self.digits[n];
		}
		var str = '', i;
		if (digitArray.length)
			for (i = 0; i < digitArray.length; ++i)
				if (digitArray[i] >= base || digitArray[i] < 0) 
					return undefined;
				else
					str = get(digitArray[i]) + str;
		else
			str += get(0);
		str += '.';
		for (i = -1; digitArray[i] !== undefined; --i)
			if (digitArray[i] >= base || digitArray[i] < 0) 
				return undefined;
			else
				str += get(digitArray[i]);
		if (longhand)
			str = '[' + str + ']';
		return str.replace(/\.:|:\./, '.').replace(/(\[):|:(\])|\.(\]|$)/g, '$1$2$3');
	};
	self.toDigits = function(str, base) {
		if (!str)
			return;
		var longhand = /^\[\d+([:\.]\d+)*\]$/.test(str);
		function get(n) {
			return longhand ? parseInt(n, 10) : self.digits.indexOf(n);
		}
		str = str.replace(/[\[\]]/g, '');
		var intPart = str.replace(/\.([^\]]*)(\]|$)/, '').split(longhand ? /\s*:\s*/g : ''),
			fracPart = str.replace(/\[?([^\.\]]*)(\.|\]|$)/, '').split(longhand ? /\s*:\s*/g : ''),
			digitArray = [],
			i;
		for (i = intPart.length - 1; i >= 0; --i) {
			digitArray[i] = get(intPart[i]);
			if (digitArray[i] < 0 || digitArray[i] >= base)
				return undefined;
		}
		if (fracPart.length > 1 || fracPart[0] != '')
			for (i = 0; i < fracPart.length; ++i) {
				digitArray[-1 - i] = get(fracPart[i]);
				if (digitArray[-1 - i] < 0 || digitArray[-1 - i] >= base)
					return undefined;
			}
		return digitArray;
	};
	self.toString = function(n, radix, dp) {
		var prefix = '';
		if (n.lt(0)) {
			n = n.times(-1);
			prefix = '-';
		}
		var digitArray = [],
			frac = n.mod(1),
			integer = n.minus(frac);
		while (integer.gt(0)) {
			var d = integer.mod(radix);
			digitArray.push(d);
			integer = integer.minus(d).div(radix);
		}
		if (frac.gt(0)) {
			var ratio = (new Big(1)).div(radix), i;
			for (i = 0; i < dp; ++i) {
				for (var p = radix - 1; p >= 0; --p) {
					var x = ratio.times(p);
					if (frac.gte(x)) {
						digitArray[-1 - i] = p;
						frac = frac.minus(x).times(radix);
						if (frac.lte(0))
							return prefix + self.fromDigits(digitArray, radix);
						break;
					}
				}
			}
			if (frac.gte(0.5))
				for (i = -dp; true; ++i)
					if (digitArray[i] == self.digits.length - 1)
						digitArray[i] = i < 0 ? undefined : 0;
					else {
						digitArray[i] = (digitArray[i] || 0) + 1;
						break;
					}
		}
		return prefix + self.fromDigits(digitArray, radix);
	};
	self.evalDigits = function(digitArray, radix) {
		if (!digitArray)
			return;
		var value = new Big(0),
			i;
		for (i = 0; i < digitArray.length; ++i) 
			value = value.times(radix).plus(digitArray[i]);
		var n = new Big(1);
		for (i = -1; digitArray[i] !== undefined; --i) 
			value = value.plus((n = n.div(radix)).times(digitArray[i]));
		return value;
	};
	self.fromString = function(n, radix) {
		var factor = 1;
		if (/^-/.test(n)) {
			n = n.substr(1);
			factor = -1;
		}
		var result = self.evalDigits(self.toDigits(n, radix), radix);
		return result && result.times(factor);
	};
	self.allYourBase = function(n, bases) {
		var out = [],
			digitArray = self.toDigits(n),
			maxDigit = -Infinity;
		if (!digitArray)
			return;
		for (var n = digitArray.length - 1; digitArray[n] !== undefined; --n)
			if (digitArray[n] > maxDigit)
				maxDigit = digitArray[n];
		bases.forEach(function(base) {
			if (base > maxDigit)
				out.push({
					base: base,
					number: self.evalDigits(digitArray, base)
				});
		});
		return out;
	}
});