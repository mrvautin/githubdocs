### Theming

`Githubdocs` comes with two templates: `default.hbs` (Bootstrap) and `material.hbs` (Materialize).

You can specify which template to use by setting the following setting in the `config.json` file:

``` json
"layoutFile": "material.hbs", // HTML layout file
"theme": "material.hbs" // Sidebar, nav and content
```

If this setting is not set, `Githubdocs` will automatically use the `layout.hbs` template.

The easiest way to create your own template is to make a copy of the existing files and extend it to your liking.