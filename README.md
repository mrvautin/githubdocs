# gitHubDocs

Easily build a searchable documentation app using markdown files in your Github Repo.

### Installation

1. Clone Repository: `git clone https://github.com/mrvautin/githubdocs.git && cd githubdocs`
2. Install dependencies: `npm install`
3. Start application: `npm start`
4. Go to  [http://127.0.0.1:5555](http://127.0.0.1:5555) in your browser

### Config

The config file is located here: `/config/config.json`.

An example config:

``` javascript
{
    "title": "githubdocs",
    "githubRepoOwner": "mrvautin",
    "githubRepoName": "githubdocs",
    "githubRepoPath": "exampleDocs",
    "alwaysFetchNewDocs": false,
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
|`alwaysFetchNewDocs`|Whether to fetch new docs on startup or whether to use docs in DB. Useful to avoid API rate limiting|
|`menuItems`|Not sure how useful this is. Set the menu items in the top navigation|