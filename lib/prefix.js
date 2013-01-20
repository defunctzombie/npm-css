// vendor
var cssp = require('cssp');
var traverse = require('traverse');

module.exports = function (name, src) {
    if (typeof opts === 'string') {
        opts = { prefix : opts };
    }

    var tree = cssp.parse(src);

    traverse(tree).forEach(function (node) {
        if (node !== 'simpleselector') {
            return;
        }

        var nodes = this.parent.node;

        // don't prefix if any of the following conditions are met:
        // .module exists as a parent then ok
        // .module exists in a set of classes right after an element
        // .module exists in the first set of classes
        for (var i=1 ; i<nodes.length ; ++i) {
            var node = nodes[i];

            // first space exists search
            if (node[0] === 's') {
                break;
            }

            if (node[0] === 'clazz' && node[1][0] === 'ident' &&
                node[1][1] === name) {
                return;
            }
        }

        // prefix the css rule
        this.parent.node.splice(1, 0,
            [ 'clazz', [ 'ident', name ] ],
            [ 's', ' ' ]
        );
    });

    return cssp.translate(tree);
};

