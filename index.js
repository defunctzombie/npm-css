// builtin
var fs = require('fs');
var path = require('path');

// vendor
var resolve = require('resolve');

module.exports = npmcss;

// process given file for // @require statements
// file should be /full/path/to/file.css
function npmcss(file) {
    // load source file
    var src = fs.readFileSync(file, 'utf8');

    // replace all instances of @require foo with proper content
    src = src.replace(/@require (.*)\n/g, function(str, name) {

        // base path for the file we want to load
        var base = path.dirname(file);

        // relative path, just read and load the file
        if (name[0] === '.') {
            var filepath = path.join(base, name);
            return '*/\n' + npmcss(filepath) + '\n/*';
        }

        var res = resolve.sync(name, {
            basedir: base,
            extensions: ['.css'],
            packageFilter: function (pkg) {
                pkg.main = pkg.css;
                return pkg;
            }
        });

        // run resolution on the required css file
        return '*/\n' + npmcss(res) + '\n/*';
    });

    return src;
}

