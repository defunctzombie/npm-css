// builtin
var fs = require('fs');
var path = require('path');

// vendor
var resolve = require('resolve');

// local
var prefix = require('./lib/prefix');

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
            // if path is a dir, see if package.json is available
            // if avail, read style field
            // if not avail or no style field, use index.css
            var filepath = path.join(base, name);

            // path is a file
            if (fs.statSync(filepath).isFile()) {
                return '*/\n' + npmcss(filepath) + '\n/*';
            }

            // path is a dir
            var pkginfo = path.join(filepath, 'package.json');

            // package.json exists for path
            // use style info and prefix
            if (fs.existsSync(pkginfo)) {
                var info = JSON.parse(fs.readFileSync(pkginfo));
                filepath = path.join(base, name, info.style || 'index.css')
                return '*/\n' + prefix(info.name, npmcss(filepath)) + '\n/*';
            }

            // no package.json, try index.css in the dir
            filepath = path.join(filepath, 'index.css');

            // do not prefix if just loading index.css from a dir
            // allows for easier organization of multi css files without prefixing
            if (fs.existsSync(filepath)) {
                return '*/\n' + npmcss(filepath) + '\n/*';
            }

            // if all else fails, return original source
            return src;
        }

        var res = resolve.sync(name, {
            basedir: base,
            extensions: ['.css'],
            packageFilter: function (pkg) {
                pkg.main = pkg.style;
                return pkg;
            }
        });

        // run resolution on the required css file
        return '*/\n' + prefix(name, npmcss(res)) + '\n/*';
    });

    return src;
}

