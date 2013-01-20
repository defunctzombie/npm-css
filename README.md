# npm-css

Require css from node modules.

## Syntax

``` css
/*
@require typeahead

@require ./foo.css
@require ./bar/baz.css
*/

.foo {
    color: red
}
```

npm-css reads comments in the format of `// @require` and inlines the CSS at that path for you. It also understands node modules.

If you `@require` a folder it will try to look for a package.json file or read `index.css` by default. See the `package.json` section below.

## CLI

To build a single css file from an entry.css with @require statements.

`npm-css entry.css -o bundle.css`

## API

If you want to build css files on the fly.

```javascript
var npmcss = require('npm-css');
var css = npmcss(/path/to/file);
```

## package.json

You can specify the stylesheet for your module by adding a `"style"` field to your package.json file. This works similarly to the `"main"` field.

## Installation

`npm install npm-css`

## MIT Licenced
