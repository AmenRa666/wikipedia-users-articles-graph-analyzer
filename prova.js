let a = ['hello', 'dear', 'bear']
let b = ['hello', 'bear', 'dear']

var difflib = require('difflib');

console.log(difflib.contextDiff(a, b, {fromfile:'before', tofile:'after'}));
