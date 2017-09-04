### Theming

`Githubdocs` comes with two templates: `index.html` (Bootstrap) and `material.html` (Materialize).

You can specify which template to use by setting the following setting in the `config.json` file:

``` json
"layoutFile": "material.html"
```

If this setting is not set, `Githubdocs` will automatically use the `index.html` template.

The easiest way to create your own template is to make a copy of the `index.html` or `material.html` file and extend it to your liking. Template files are generally very basic with the `div` with the ID of `main` holding the information from Markdown files.
