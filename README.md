# Githubdocs

Easily build a searchable documentation Single Page Application (SPA) using markdown files in your Github Repo or local Markdown files. Github docs is a lightweight alternative to Gitbooks allowing simple but powerful Markdown generate documentation websites.

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

See example docs here: [https://github.com/mrvautin/githubdocs/tree/master/docs](https://github.com/mrvautin/githubdocs/tree/master/docs)

### Search

Search is built using [js-search](https://github.com/bvaughn/js-search). The index is built and stored in memory on startup. When searched from the client the API is called returning any matching docs. The menu will then display the match docs. When the search term is removed, the full list of docs is returned.

### Config

The config file is located here: `/config/config.json`.

An example config:

``` javascript
{
    "title": "githubdocs",
    "githubRepoOwner": "mrvautin",
    "githubRepoName": "githubdocs",
    "githubRepoPath": "exampleDocs",
    "updateDocsCron": "*/5 * * * *",
    "addAnchors": true,
    "menuItems": [
        {
            "menuTitle": "About",
            "menuLink": "/about"
        },
        {
            "menuTitle": "Contact",
            "menuLink": "/contact"
        }
    ],
    "static": false
}
```


|Setting|Description|
|--- |--- |
|`title`|Sets the value to be displayed at the top of the page|
|`githubRepoOwner`|Owner/username of the Github repo|
|`githubRepoName`|Name of the repo holding the Markdown files|
|`githubRepoPath`|Directory relative to the root of the repo holding the Markdown files|
|`updateDocsCron`|A cron schedule to reindex your Markdown files/docs from Github or static|
|`addAnchors`|Transforms H1, H2, H3, H4, H5 info HTML anchor points for easy sharing|
|`menuItems`|Not sure how useful this is. Set the menu items in the top navigation|
|`static`|Reads Markdown files statically from `/docs` folder. Defaults to `false`|

## Static websites

It's also possible to create a site from local Markdown files rather than using a Github repo.

### Starting

You can start your website using the following command from the root of your app:

```
node app.js
```

### Static

To do this you place your Markdown files into the `docs` folder and set `static` to `true` in your config.

An example `config.json` for a static site:

``` json
{
    "title": "githubdocs",
    "githubRepoOwner": "mrvautin",
    "githubRepoName": "githubdocs",
    "githubRepoPath": "exampleDocs",
    "updateDocsCron": "*/5 * * * *",
    "addAnchors": true,
    "menuItems": [
        {
            "menuTitle": "About",
            "menuLink": "/about"
        },
        {
            "menuTitle": "Contact",
            "menuLink": "/contact"
        }
    ],
    "static": true
}
```

### Layouts

You can also specify your own layout file. The default `views/layouts/layout.hbs` file is used unless you specify a different file in your `config.json`.

``` json
{
    "layoutFile": "material.hbs"
}
```

Included is a `material.hbs` design template and a Bootstrap template (`default.hbs`).