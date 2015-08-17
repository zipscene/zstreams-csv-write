# zstreams-csv-write
CSV streaming generator for nodejs

```javascript
var CSVParse = require('zstreams-csv-parse');

var input = [
	{ Name: 'George', Gender: 'M', Age: 32 },
	{ Name: 'Jackson, Steven', Gender: 'M', Age: 25 },
	{ Name: 'Maria "Killer" Sanchez', Age: 21 }
];
var csvParse = new CSVParse([ 'Name', 'Gender', 'Age' ]);
zstreams.fromArray(input).pipe(csvParse).intoString(function(error, output) {
	console.log(output.split('\n'));
	// [
	//   'Name,Gender,Age',
	//   'George,M,32',
	//   '"Jackson, Steven",M,25',
	//   '"Maria ""Killer"" Sanchez",,21'
	// ]
});
```

It's a streaming CSV generator. 'Nuff said.

An options object can be provided as a second parameter to the constructor. The following options are accepted:
* `delimiter`: The record delimiter in the output data. Defaults to ','.
* `escape`: The record quote character. Defaults to '"'.
