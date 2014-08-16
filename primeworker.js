importScripts('big.js/big.js', 'prime.js');

function package(factors, done) {
	return {
		factors: factors.map(function(f) {
			return f.toFixed(0);
		}),
		done: done
	};
}

self.addEventListener('message', function(e) {
	try {
		var big = new Big(e.data),
			factors = factorise.factoriseBig(big, function(factors) {
				self.postMessage(package(factors, false));
			});
		self.postMessage(package(factors, true));
	} catch(e) {
		self.postMessage({
			error: e
		});
	}
});