# gitHubDocs

Easily build a searchable documentation Single Page Application (SPA) using markdown files in your Github Repo.

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