var assert = require('assert');
var path = require('path');
var fs = require('fs');

var npmcss = require('../');

var kGenerate = process.env.TEST_GENERATE;

var exp_dir = path.join(__dirname, 'expected');
var fix_dir = path.join(__dirname, 'fixtures');

var files = fs.readdirSync(fix_dir).filter(function(file) {
    return /[.]css$/.test(file);
});

files.forEach(function(file) {
    var actual_file = path.join(fix_dir, file);
    var expected_file = path.join(exp_dir, file);

    test(file, function() {
        var actual = npmcss(actual_file);

        if (kGenerate) {
            fs.writeFileSync(expected_file, actual, 'utf8');
            return;
        }

        var expected = fs.readFileSync(expected_file, 'utf8');
        assert.equal(actual, expected);
    });
});

