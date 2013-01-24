// builtin
var fs = require('fs');
var path = require('path');

// vendor
var resolve = require('resolve');
var cssp = require('cssp');
var traverse = require('traverse');

// local
var prefix = require('./lib/prefix');

// replace nodes with tree
// nodes is an array representing a node
function replace(nodes, tree) {

    // truncate previous nodes
    nodes.splice(0, nodes.length);

    // insert tree as new nodes
    tree.forEach(function(node) {
        nodes.push(node);
    });
}

// flatten @imports given a basepath, and a tree
// inline all of the import statements into the tree
// @return a tree with all statements inlined
function flatten(file) {
    var src = fs.readFileSync(file, 'utf8');

    var base = path.dirname(file);
    var tree = cssp.parse(src);

    traverse(tree).forEach(function (node) {
        var self = this;

        if (node !== 'atrules') {
            return;
        }

        node = this.parent.node;

        // ignore non import
        if (node[1][0] !== 'atkeyword' && nodes[1][1][0] !== 'ident' &&
           node[1][1][1] !== 'import') {
            return;
        }

        // ignore non string imports
        if (node[3][0] !== 'string') {
            return;
        }

        // remove quotes from imported name
        var name = node[3][1].replace(/["']/g, '');

        // @import "module"
        if (name[0] !== '.') {

            // lookup the entry css file
            var filepath = resolve.sync(name, {
                basedir: base,
                extensions: ['.css'],
                packageFilter: function (pkg) {
                    pkg.main = pkg.style;
                    return pkg;
                }
            });

            // run css file through tree -> flatten -> prefix
            // get required module as a css tree
            // replace @import node with new tree
            return replace(self.parent.node, prefix(name, flatten(filepath)));
        }

        var filepath = path.join(base, name);

        // path is a file
        if (fs.statSync(filepath).isFile()) {
            return replace(self.parent.node, flatten(filepath));
        }

        // path is a dir
        var pkginfo = path.join(filepath, 'package.json');

        // package.json exists for path
        // use style info and prefix
        if (fs.existsSync(pkginfo)) {
            var info = JSON.parse(fs.readFileSync(pkginfo));
            filepath = path.join(base, name, info.style || 'index.css')
            return replace(self.parent.node, prefix(info.name, flatten(filepath)));
        }

        // no package.json, try index.css in the dir
        filepath = path.join(filepath, 'index.css');

        // do not prefix if just loading index.css from a dir
        // allows for easier organization of multi css files without prefixing
        if (fs.existsSync(filepath)) {
            return replace(self.parent.node, flatten(filepath));
        }
    });

    return tree;
}

// process given file for // @require statements
// file should be /full/path/to/file.css
module.exports = function(file) {
    var base = path.dirname(file);
    return cssp.translate(flatten(file));
};

