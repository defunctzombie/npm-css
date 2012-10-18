var ReadStream = require("read-stream")
    , resolve = require("resolve")
    , fs = require("fs")
    , chain = require("chain-stream")
    , path = require("path")
    , inspect = require("util").inspect
    , cssp = require("cssp")
    , flatten = require("flatten")

    , requireRegExp = /^@require(.*)$/

module.exports = NpmCss

function NpmCss(files, options) {
    options = options || {}
    options.basedir = options.basedir || path.dirname(files[0])

    return chain(files)
        .map(function (fileName) {
            var file = path.resolve(process.cwd(), fileName)

            return fs.createReadStream(fileName)
        })
        // .toArray(log("files"))
        .flattenSerial()
        // .toArray(log("flattened state"))
        .reduce(sum, "")
        // .toArray(log("summer state"))
        .concatMap(function (source) {
            return cssp.parse(source)
        })
        .concatMap(function (list) {
            if (list[0] !== "comment") {
                return [list]
            }

            var commentText = list[1]

            if (!isRequire(commentText)) {
                return [list]
            }

            var lines = commentText.split("\n")

            lines = lines.filter(isRequire)
                .map(function (str) {
                    return str.trim()
                })

            var tokens = flatten(lines.map(extractUris, {
                basedir: options.basedir
            }).map(function (file) {
                return fs.readFileSync(file).toString()
            }).map(function (source) {
                return cssp.parse(source).slice(1)
            }), 1)

            return tokens
        })
        .reduce(concat, [])
        .map(function (tokens) {
            return cssp.translate(tokens)
        })
        // .toArray(log("mapped state"))
}

function isRequire(value) {
    return value.indexOf("@require") !== -1
}

function extractUris(value) {
    var basedir = this.basedir

    value = value.trim()
    var uri = requireRegExp.exec(value)[1].trim()
    return resolve.sync(uri, {
        basedir: basedir
        , extensions: [".css"]
        , packageFilter: function ($package) {
            $package.main = $package.css
            return $package
        }
    })
}

function sum(acc, value) {
    return acc + value
}

function concat(acc, value) {
    return acc.concat([value])
}

function log(str) {
    return function (list) {
        console.error(str, list)
    }
}
