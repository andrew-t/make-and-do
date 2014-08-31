'use strict';

angular.module('rebase', [])
.service('baseConverter', function() {
	var digits = '0123456789abcdefghijklmnopqrstuvwxyz';
	this.fromDigits = function(digitArray, base) {
		var longhand = base > digits.length;
		function get(n) {
			return longhand ? n.toString() + ':' : digits[n];
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
	this.toDigits = function(str, base) {
		var longhand = /^\[\d+([:\.]\d+)*\]$/.test(str);
		function get(n) {
			return longhand ? parseInt(n, 10) : digits.indexOf(n);
		}
		var intPart = str.replace(/\.([^\]]*)(\]|$)/, '').split(longhand ? ':' : ''),
			fracPart = str.replace(/\[?([^\.\]]*)(\.|\]|$)/, '').split(longhand ? ':' : ''),
			digitArray = [],
			i;
		for (i = intPart.length - 1; i >= 0; --i) {
			digitArray[i] = get(intPart[i]);
			if (digitArray[i] < 0 || digitArray[i] >= base)
				return undefined;
		}
		for (i = 0; i < fracPart.length; ++i) {
			digitArray[-1 - i] = get(fracPart[i]);
			if (digitArray[-1 - i] < 0 || digitArray[-1 - i] >= base)
				return undefined;
		}
		return digitArray;
	};
	this.toString = function(n, radix, dp) {
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
							return prefix + this.fromDigits(digitArray, radix);
						break;
					}
				}
			}
			if (frac.gte(0.5))
				for (i = -dp; true; ++i)
					if (digitArray[i] == digits.length - 1)
						digitArray[i] = i < 0 ? undefined : 0;
					else {
						digitArray[i] = (digitArray[i] || 0) + 1;
						break;
					}
		}
		return prefix + this.fromDigits(digitArray, radix);
	};
	this.fromString = function(n, radix) {
		var value = new Big(0),
			factor = 1,
			i;
		if (/^-/.test(n)) {
			n = n.substr(1);
			factor = -1;
		}
		var digitArray = this.toDigits(n, radix);
		if (!digitArray)
			return;
		for (i = 0; i < digitArray.length; ++i) 
			value = value.times(radix).plus(digitArray[i]);
		var n = new Big(1);
		for (i = -1; digitArray[i] !== undefined; --i) 
			value = value.plus((n = n.div(radix)).times(digitArray[i]));
		return value.times(factor);
	};
});