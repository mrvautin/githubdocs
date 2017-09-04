# gitHubDocs

Easily build a searchable documentation Single Page Application (SPA) using markdown files in your Github Repo or local Markdown files.

## Website from Github Repo

### Installation

1. Clone Repository: `git clone https://github.com/mrvautin/githubdocs.git && cd githubdocs`
2. Install dependencies: `npm install`
3. Start application: `npm start`
4. Go to  [http://127.0.0.1:5555](http://127.0.0.1:5555) in your browser

### Demo

[https://githubdocs.markmoffat.com](https://githubdocs.markmoffat.com)


### Markdown files

The docs menu and files are built using files from your Github repo set in the config. Files should have the title of the doc in a single markdown hash/# (HTML = H1) tag in the file. This is used to build the slug of the doc and the menu title etc.

See example docs here: [https://github.com/mrvautin/githubdocs/tree/master/exampleDocs](https://github.com/mrvautin/githubdocs/tree/master/exampleDocs)

### Search

Search is built using [Lunr.js](https://github.com/olivernn/lunr.js/). The index is built and stored in memory on startup. When searched from the client the API is called returning any matching docs from the embedded DB. The menu will then display the match docs. When the search term is removed, the full list of docs is returned.

### Config

The config file is located here: `/config/config.json`.

An example config:

``` javascript
{
    "title": "githubdocs",
    "githubRepoOwner": "mrvautin",
    "githubRepoName": "githubdocs",
    "githubRepoPath": "exampleDocs",
    "updateDocsInterval": 300000,
    "menuItems": [
        {
            "menuTitle": "About",
            "menuLink": "/about"
        },
        {
            "menuTitle": "Contact",
            "menuLink": "/contact"
        }
    ]
}
```


|Setting|Description|
|--- |--- |
|`title`|Sets the value to be displayed at the top of the page|
|`githubRepoOwner`|Owner/username of the Github repo|
|`githubRepoName`|Name of the repo holding the Markdown files|
|`githubRepoPath`|Directory relative to the root of the repo holding the Markdown files|
|`updateDocsInterval`|Determines the interval (in milliseconds) to poll Github for updates to your Markdown files/docs|
|`menuItems`|Not sure how useful this is. Set the menu items in the top navigation|

## Static websites

It's also possible to create a site from local Markdown files rather than using a Github repo.

### Building

You can build your website using the following command from the root of your app:

```
node githubdocs build
```

### Starting

You can start your website using the following command from the root of your app:

```
node githubdocs serve
```

Or

```
node server.js
```

### Config

To do this you place your Markdown files into the `docs` folder and add the Titles and file names to your `config.json` file.

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

The `title` property will be used for the menu, title and slug. The `file` value is the name and path to the file.

### Layouts

You can also specify your own layout file. The default `index.html` file is used unless you specify a different file in your `config.json`.

``` json
{
    "layoutFile": "material.html"
}
```

Included is a `material.html` design template and a Bootstrap template (`index.html`).