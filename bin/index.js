var argv = require("optimist")
        .usage("Usage: npm-css [entry file] {OPTIONS}")
        .wrap(80)
        .option("outfile", {
            alias: "o"
            , desc: "Write the bundled css to this file\n" +
                "If unspecified the output will go to stdout"
        })
        .option("basedir", {
            alias: "b"
            , desc: ""
        })
        .argv
    , fs = require("fs")

    , NpmCss = require("..")
    , css = NpmCss(argv._, argv)
    , output

if (argv.outfile) {
    output = fs.createWriteStream(argv.outfile)
} else {
    output = process.stdout
}

css.pipe(output)
