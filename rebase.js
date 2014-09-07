'use strict';

angular.module('rebase', [])
.service('baseConverter', function() {

	// These functions convert between numeric bases. They are used in more than one page so they're in this 'service'.
	// Internally, numbers are represented as a 'digit array', which is a slightly clunky format that just happens to be
	// convenient:
	//                     { the '(n-1)th' digit, where n ≥ 0
	//     digitArray[n] = {
	//                     { the '-nth' digit after the point, where n < 0
	//
	// So, for example, 123.456 is represented as:
	//     n               -3	-2	-1	 0	 1	 2
	//     digitArray[n]    6	 5	 4	 1	 2	 3

	var self = this;
	self.digits = '0123456789abcdefghijklmnopqrstuvwxyz';

	// This writes a digit array to a string in a given base.
	// Like all the methods below, it returns 'undefined' if anything invalid goes in.
	self.fromDigits = function(digitArray, base) {
		// If we don't have enough digits for this base, write it 'longhand' with numbers.
		var longhand = base > self.digits.length;
		function get(n) {
			// Convert a number to a single digit:
			return longhand ? n.toString() + ':' : self.digits[n];
		}
		var str = '', i;
		// The integer part is pretty easy:
		if (digitArray.length)
			for (i = 0; i < digitArray.length; ++i)
				if (digitArray[i] >= base || digitArray[i] < 0) 
					return undefined;
				else
					str = get(digitArray[i]) + str;
		else
			str += get(0);
		// The fraction part isn't too hard either:
		str += '.';
		for (i = -1; digitArray[i] !== undefined; --i)
			if (digitArray[i] >= base || digitArray[i] < 0) 
				return undefined;
			else
				str += get(digitArray[i]);
		// Tidy up the string and return it.
		if (longhand)
			str = '[' + str + ']';
		return str.replace(/\.:|:\./, '.').replace(/(\[):|:(\])|\.(\]|$)/g, '$1$2$3');
	};

	// This converts a string to a digit array in a given base.
	self.toDigits = function(str, base) {
		if (!str)
			return;
		// Numbers can be input as "12ab" or "[1,2,10,11]". This returns 'true' for the second type.
		var longhand = /^\[\d+([:\.]\d+)*\]$/.test(str);
		function get(n) {
			// This function turns a digit string into the number it represents:
			return longhand ? parseInt(n, 10) : self.digits.indexOf(n);
		}
		// Remove square brackets
		str = str.replace(/[\[\]]/g, '');
		// Split the string into an array of strings ('1', '2', etc) for the integer part and the fraction part.
		var intPart = str.replace(/\.([^\]]*)(\]|$)/, '').split(longhand ? /\s*:\s*/g : ''),
			fracPart = str.replace(/\[?([^\.\]]*)(\.|\]|$)/, '').split(longhand ? /\s*:\s*/g : ''),
			digitArray = [],
			i;
		// Process the arrays, and create a digit array.
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

	// This writes a number in a given base (and to a given number of decimal places)
	self.toString = function(n, radix, dp) {
		// It's easier to handle negative numbers explicitly:
		var prefix = '';
		if (n.lt(0)) {
			n = n.times(-1);
			prefix = '-';
		}
		// The integer part is straightforward...
		var digitArray = [],
			frac = n.mod(1),
			integer = n.minus(frac);
		while (integer.gt(0)) {
			var d = integer.mod(radix);
			digitArray.push(d);
			integer = integer.minus(d).div(radix);
		}
		// ... but the fraction part is tricky.
		if (frac.gt(0)) {
			var ratio = (new Big(1)).div(radix), i;
			// This loop limits us to the number of decimal places we wanted.
			for (i = 0; i < dp; ++i) {
				// There may be a better way of doing this, but we loop from the biggest digit allowed (base - 1) to zero,
				// and check if the remaining fraction part is big enough for the digit p to be next.
				for (var p = radix - 1; p >= 0; --p) {
					var x = ratio.times(p);
					if (frac.gte(x)) {
						// If so, we put p in the array, adjust 'frac' for the next digit, and continue,
						// unless frac = 0, in which case we're done.
						digitArray[-1 - i] = p;
						frac = frac.minus(x).times(radix);
						if (frac.lte(0))
							return prefix + self.fromDigits(digitArray, radix);
						break;
					}
				}
			}
			// If the final value of frac ≥ 0.5, we should really round up rather than truncating.
			// Remove any 9s (in decimal; base-1s otherwise) from the end of the string, then add one to the last digit you see.
			// Bear in mind that 9s before the decimal point become zeros and are not removed.
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

	// This converts a digit array to a number in a given base.
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

	// This converts a number from a string to a number in a given base.
	self.fromString = function(n, radix) {
		var factor = 1;
		if (/^-/.test(n)) {
			n = n.substr(1);
			factor = -1;
		}
		var result = self.evalDigits(self.toDigits(n, radix), radix);
		return result && result.times(factor);
	};
	
	// This converts one string to numbers in many bases.
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