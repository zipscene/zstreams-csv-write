var Transform = require('zstreams').Transform;
var util = require('util');

/*
 * It's a stream! And you use it to write out csv!!
 * It inherits from transform but that's just so we can use flush. It's totally a writable.
 * Params:
 *   filename (String): The path to the file you want to write out. If the past is relative (does not begin with /), it will be appended to the
 *     outDirectory specified in the config.
 *   headers (Array): An array of header names for this csv. You will be expected to write objects to the stream that map these header keys
 *     to the values to be written. Missing keys in each payload will be interpreted as blank entries.
 *   opts (Object): For completeness' sake, options to alter the structure of the output csv. If I ever catch you actually using these, I will personally
 *     refactor your code, and then refactor you.
 *     delimiter: Defaults to ','
 *     quote: Defaults to '"'
 */
var CsvWriter = function(headers, opts) {
	this.headers = headers;
	if(!opts) opts = {};
	this.delimiter = opts.delimiter ? opts.delimiter[0] : ',';
	this.quote = opts.quote ? opts.quote[0] : '"';
	this.lineDelimiter = '\n';
	Transform.call(this, {
		readableObjectMode: false,
		writableObjectMode: true,
	});
};
util.inherits(CsvWriter, Transform);

CsvWriter.prototype._stringifyValue = function(value) {
	var self = this;
	var k;
	if(value === undefined || value === null) return '';
	if(typeof value != 'string') value = value.toString();
	if(value.indexOf(self.delimiter) == -1 && value.indexOf(self.quote) == -1 && value.indexOf(self.lineDelimiter) == -1) {
		return value;
	} else {
		// Gotta quote this. Go through and double-quote any quote characters.
		for(k = 0; k < value.length; k++) {
			if(value[k] === self.quote) {
				value = value.slice(0, k) + self.quote + value.slice(k);
				k++;
			}
		}
		return self.quote + value + self.quote;
	}
};

CsvWriter.prototype._writeHeaderRow = function() {
	var self = this;
	var output = '';
	var i;
	if(self.headerWritten || !Array.isArray(self.headers)) return;
	if(!Array.isArray(self.headers) || self.headers.length === 0) throw new Error('No headers provided to CsvWriter');
	for(i = 0; i < self.headers.length; i++) {
		var header = self.headers[i];
		if(i !== 0) output += self.delimiter;
		output += self._stringifyValue(header);
	}
	output += self.lineDelimiter;
	self.push(output);
	self.headerWritten = true;
};

CsvWriter.prototype._writeOutputLine = function(obj) {
	var self = this;
	var output = '';
	var i;
	if(Array.isArray(obj)) {
		for(i = 0; i < obj.length; i++) {
			if(i !== 0) output += self.delimiter;
			if (!obj[i]) continue;
			output += self._stringifyValue(obj[i]);
		}
	} else {
		if(!Array.isArray(self.headers) || self.headers.length === 0) throw new Error('No headers provided to CsvWriter');
		for(i = 0; i < self.headers.length; i++) {
			var header = self.headers[i];
			if(i !== 0) output += self.delimiter;
			if(!obj[header]) continue;
			var value = obj[header];
			var toWrite = self._stringifyValue(value);
			output += toWrite;
		}
	}
	output += self.lineDelimiter;
	self.push(output);
};

CsvWriter.prototype._write = function(chunk, encoding, cb) {
	var self = this;
	self._writeHeaderRow();
	try {
		self._writeOutputLine(chunk);
	} catch(error) { return cb(error); }
	cb();
};

CsvWriter.prototype._flush = function(cb) {
	var self = this;
	self._writeHeaderRow();
	cb();
};

module.exports = CsvWriter;
