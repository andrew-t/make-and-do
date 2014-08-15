'use strict';
// look up sass from http://codepen.io/thebabydino/pen/IdJCi

var options = {
	maxN: 1000,
	centred: [/*5, 7*/],
	generalised: [3, 4, 5, 6],
	delayStep: 50, // ms
	showNumbers: false,
	indexFrom: 1,
	margin: 0.5,
	sumDistance: 1.2,
	polygonSpacing: 0.6
}, update;

console.log('Hello! Since you\'ve opened the dev console on a mathsy site, I assume ' +
	'you\re my kind of person, so I\'m going to tell you a secret: I have done a naughty ' +
	'thing and put all the settings on the global scope so you can play with them. ' +
	'the object is called `options`, so feel free to play with it and see what happens. ' +
	'Call `update()` once you\'re finished to refresh the view.');

console.log('Keys in `options`:');
console.log(Object.keys(options));