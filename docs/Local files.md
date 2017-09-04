### Using local Markdown files

`Githubdocs` builds static files using the files supplied in the configuration file. Each file is then used to build the Single page application. When changes are made you can simple restart the website and it will be automatically updated.

##### Building

You can build your website using the following command from the root of your app:

``` bash
node githubdocs build
```

##### Starting

You can start your website using the following command from the root of your app:

``` bash
node githubdocs serve
```

Or

``` bash
node server.js
```

##### Local files configuration

Place your Markdown files into the `docs` directory and add the `titles` and `file` names to your `config/config.json` file.

An example `config.json` for a static site:

``` json
"docs": [
    {
        "title": "Aut procul ursos nondum",
        "file": "docs/Aut procul ursos nondum.md"
    },
    {
        "title": "dsdsd ursos sdsdds dsdsd",
        "file": "docs/dsdsd ursos sdsdds dsdsd.md"
    },
    {
        "title": "Erant ventorum aliter esse pervenientia mutua numquam",
        "file": "docs/Erant ventorum aliter esse pervenientia mutua numquam.md"
    },
    {
        "title": "Suam aera",
        "file": "docs/Suam aera.md"
    }
]
```

At startup or build, `githubdocs` renders these Markdown files into HTML and stores them in the `dist` directory.