importScripts('big.js/big.js', 'prime.js');

self.addEventListener('message', function(e) {
	try {
		var big = new Big(e.data),
			factors = factorise.factoriseBig(big);
		self.postMessage(factors.map(function(f) {
			return f.toFixed(0);
		}));
	} catch(e) {
		self.postMessage({
			error: e
		});
	}
});