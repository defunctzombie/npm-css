var test = require("tap").test
    , path = require("path")

    , NpmCss = require("..")
    , trycatch = require("trycatch")

    , basedir = path.join(__dirname, "fixtures")
    , input = [path.join(basedir, "input.css")]


test("css is correct", function (t) {
    NpmCss(input, {
        basedir: basedir
    })
        .value(function (str) {
            console.error("results", str)
            t.end()
        })
})
