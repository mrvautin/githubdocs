### Configuration

The config file is named `config.json` and is located in the `config` directory (`/config/config.json`). Any changes to this configuration file require a restart of your application.

An example `config.json` file:

``` javascript
{
    "title": "githubdocs",
    "githubRepoOwner": "mrvautin",
    "githubRepoName": "githubdocs",
    "githubRepoPath": "exampleDocs",
    "updateDocsInterval": 300000,
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
|`addAnchors`|Transforms `H1`, `H2`, `H3`, `H4`, `H5` info HTML anchor points for easy sharing|
|`menuItems`|Not sure how useful this is. Set the menu items in the top navigation|