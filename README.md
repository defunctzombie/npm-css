# npm-css

Require css from npm

## CLI

`npm-css entry.css -o bundle.css`

## Syntax

``` css
/*
@require foo.css
@require ./bar/baz.css
@require readable
*/

.foo {
    color: red
}
```

npm-css reads comments in the format of `// @require` and inlines
the CSS at that path for you. It also understands node modules.

If you `@require` a folder it will read `index.css` by default

## package.json

If you publish a module on npm with CSS you can add the `"css"`
field to your package.json to set a different entry point then
`index.css`. This works similarly to the `"main"` field

## Installation

`npm install npm-css`

## Contributors

 - Raynos

## MIT Licenced
