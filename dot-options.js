'use strict';

var options = {
	maxN: 1000,
	centred: [5, 6, 7],
	generalised: [3, 4, 5, 7],
	fibonacci: [ [1, 1] ],
	cubes: true,
	cubeDimensions: {
		x: {
			x: 1,
			y: 0.2
		},
		y: {
			x: 0,
			y: 1.1
		},
		z: {
			x: -0.8,
			y: 0.3
		},
		size: 1
	},
	appearDelay: {
		step: 50,
		maxTotal: 2500,
		minStep: 10
	},
	hideDelay: {
		step: 10,
		maxTotal: 2500,
		minStep: 0
	},
	preTransitionDelay: 25, //ms
	showNumbers: true,
	indexFrom: 1, // the number on the first dot
	margin: 0.1, // in dot diameters, I think
	sumDistance: 1, // 1 is the smallest sane number
	polygonSpacing: 0.6, // in radii
	fibonacciRadius: 1.1,
	fibonacciSpacing: 1,
	fontSize: 0.5, // Multiplied by the dot size
	// Hidden maths! The hue step is 360° / φ
	// (or 360° * φ – perversely, they're equivalent)
	// since I saw at MathsJam once that this produces the most randomly-spaced-looking dots
	// and is how the seeds are arranged in a sunflower.
	// This means that when you get semiprimes whose largest factor is close to a Fibonacci number
	// stripes start to appear. Also the quadrants in Fibonacci spirals always start reddish and end greenish.
	hueStep: 180 * (1 + Math.sqrt(5)),
	saturation: 70,
	lightness: 50,
	autoArrangeDelay: 450
}, update = function() {
	update.hooks.forEach(function(h) {
		h();
	});
};

update.hooks = [];

console.log('Hello! Since you\'ve opened the dev console on a mathsy site, I assume ' +
	'you\'re my kind of person, so I\'m going to tell you a secret: I have done a naughty ' +
	'thing and put all the settings on the global scope so you can play with them. ' +
	'The object is called `options`, so feel free to play with it and see what happens. ' +
	'Call `update()` once you\'re finished to refresh the view.');

console.log('All times are in milliseconds. Saturation and lightness are in percent. Hue is in degrees.');
// Which makes sense because even though radians are better, it's rare you want 1 radian of hue,
// and CSS doesn't have a π constant. Still, here's hoping for CSS4.

console.log('Keys in `options`:');
console.log(Object.keys(options));