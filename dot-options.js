'use strict';

var options = {
	maxN: 1000,
	centred: [5, 6, 7],
	generalised: [3, 4, 5, 7],
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
	fontSize: 0.4, // Multiplied by the dot size
	hueStep: 180 * (1 + Math.sqrt(5)), // hidden maths!!
	saturation: 50,
	lightness: 50,
	autoUpdateDelay: 750
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

console.log('Keys in `options`:');
console.log(Object.keys(options));