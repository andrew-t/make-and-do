// options:
var mangle = true,
	squeeze = true,
	liftVars = true,
	outDir = 'dist',
	basePath = '/wp-content/gadgets',
	output = 'gadgets.min.js',
	errContext = 10,
	dependencies = ['angular.min.js', 'big.js/big.min.js'],
	noConcat = [/worker\.js$/i, /\.min\.js$/i, /^factorise\.js$/i, /-options\.js$/i, /-demo\.js$/i, /^pascal\.js$/i, /^countdown\.js$/i];

var fs = require('fs'),
	uglify = require('./UglifyJS/uglify-js.js'),
	files = fs.readdirSync('.'),
	totalIn = 0,
	totalOut = 0;

try {
	fs.mkdirSync(outDir);
} catch(e) { }

function forEachFile(extension, callback) {
	var rightType = new RegExp('\.' + extension + '$', 'i');
	files.forEach(function(filename) {
		if (/^_/.test(filename) || !rightType.test(filename))
			return;
		var file = fs.statSync(filename);
		if (file.isDirectory())
			return;
		callback(filename);
	});
}

function isConcat(filename) {
	var concat = true;
	noConcat.forEach(function(filter) {
		if (filter.test(filename))
			concat = false;
	});
	return concat;
}

// JavaScript

function minify(code, fn) {
	var ast;
	try {
		ast = uglify.parser.parse(code.replace(/new\s+Worker\((['"])/g,
											   "new Worker($1" + basePath + '/'));
	} catch (e) {
		console.log(e);
		for (var l = e.line - errContext; l <= e.line + errContext; ++l)
			console.log(code.split('\n')[l]);
		throw 'Balls.';
	}

	if (liftVars)
		ast = uglify.uglify.ast_lift_variables(ast);
	if (mangle)
		ast = uglify.uglify.ast_mangle(ast, {
			toplevel: false,
			except: ['options']
		});
	if (squeeze)
		ast = uglify.uglify.ast_squeeze(ast);

	var minified = uglify.uglify.gen_code(ast);

	totalIn += code.length;
	totalOut += minified.length;
	fs.writeFileSync(outDir + '/' + fn, minified);

	console.log('File: ' + fn);
	console.log('Original length: ' + code.length);
	console.log('Minified length: ' + minified.length);
	console.log('Compression ratio: ' + (minified.length / code.length));
	console.log('');

	return minified;
}

var code = '';

forEachFile('js', function(filename) {
	if (!/\.min\.js$/i.test(filename)) {
		var content = fs.readFileSync(filename, 'utf8')
				.replace(/['"]use strict['"];/gi, '')
				.replace(/['"]([^'"]+\/)?([^\/'"]+)\.js['"]/gi, "'$2.min.js'") + '\n\n';
		if (isConcat(filename))
			code += content;
		else
			minify(content, filename.replace(/\.js$/i, '.min.js'));
	}
});

minify(code, output);

console.log('Total original length: ' + totalIn);
console.log('Total minified length: ' + totalOut);
console.log('Compression ratio: ' + (totalOut / totalIn));

// HTML

forEachFile('html', function(filename) {
	var lines = fs.readFileSync(filename, 'utf8').split('\n'),
		out = '',
		done = false,
		getFn = /^\s*<script src="([^"]+)"><\/script>$/i;
	lines.forEach(function(line) {
		var fn = line.replace(getFn, '$1');
		if (fn != line && isConcat(fn)) {
			if (!done) {
				out += '\t\t<script src="' + output + '"></script>';
				done = true;
			}
		} else
			// strip dirs from dependencies:
			out += line.replace(/<script src="([^"]*\/)?([^\/]+)\.js"><\/script>/i, 
				'<script src="$2.min.js"></script>').replace(/\.min\.min\.js/ig, '.min.js') + '\n';
	});
	fs.writeFileSync(outDir + '/' + filename, out);
});

// CSS

forEachFile('css', function(filename) {
	fs.writeFileSync(outDir + '/' + filename, 
		fs.readFileSync(filename, 'utf8')
		.replace(/\/\*.*?\*\//gm, '')
		.replace(/;?\s*([{:;}])\s*/g, '$1')
		.replace(/\s+/g, ' '));
});

// dependencies

dependencies.forEach(function(dependency) {
	fs.writeFileSync(outDir + '/' + dependency.replace(/^.*\/([^\/]+)$/i, '$1'),
		fs.readFileSync(dependency));
});