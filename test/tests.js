var CsvWriter = require('../index');
var zstreams = require('zstreams');
var expect = require('chai').expect;

function testInputOutput(writer, inputArr, outputArr, done) {
	zstreams.fromArray(inputArr).pipe(writer).intoString(function(error, actualOutput) {
		if(error) return done(error);
		var actualOutputArr = actualOutput.split('\n');
		for(var i = 0; i < actualOutputArr.length; i++) {
			var actual = actualOutputArr[i], expected = outputArr[i];
			if(!expected) continue;
			expect(actual).to.deep.equal(expected);
		}
		done();
	});
}

describe('zstreams-csv-write', function() {

	var basicHeaders = [ 'name', 'gender', 'age' ];

	it('basic usage', function(done) {
		var writer = new CsvWriter(basicHeaders);
		var input = [
			{ name: 'Maria', age: 21, gender: 'F' },
			{ name: 'Jack', age: 20, gender: 'M' }
		];
		var output = [
			'name,gender,age',
			'Maria,F,21',
			'Jack,M,20'
		];
		testInputOutput(writer, input, output, done);
	});

	it('outputs header on no input data', function(done) {
		var writer = new CsvWriter(basicHeaders);
		var input = [];
		var output = [ 'name,gender,age' ];
		testInputOutput(writer, input, output, done);
	});

	it('handles incomplete input', function(done) {
		var writer = new CsvWriter(basicHeaders);
		var input = [
			{ name: 'Maria', gender: 'F' },
			{ name: 'Jack' }
		];
		var output = [
			'name,gender,age',
			'Maria,F,',
			'Jack,,'
		];
		testInputOutput(writer, input, output, done);
	});

	it('quotes cells containing delimiters', function(done) {
		var writer = new CsvWriter(basicHeaders);
		var input = [
			{ name: 'Sanchez, Maria', gender: 'F', age: 21 },
		];
		var output = [
			'name,gender,age',
			'"Sanchez, Maria",F,21'
		];
		testInputOutput(writer, input, output, done);
	});

	it('double-quotes input quotes', function(done) {
		var writer = new CsvWriter(basicHeaders);
		var input = [
			{ name: 'Maria "The Bomb" Sanchez', gender: 'F', age: '"21"' },
		];
		var output = [
			'name,gender,age',
			'"Maria ""The Bomb"" Sanchez",F,"""21"""'
		];
		testInputOutput(writer, input, output, done);
	});

	it('allows for changing delimiter and quote parameters', function(done) {
		var writer = new CsvWriter(basicHeaders, {
			delimiter: '|',
			quote: '*'
		});
		var input = [
			{ name: 'Maria|Sanchez', gender: 'F', age: 21 },
		];
		var output = [
			'name|gender|age',
			'*Maria|Sanchez*|F|21'
		];
		testInputOutput(writer, input, output, done);
	});

});
