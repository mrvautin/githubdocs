### How it works?

##### Using a Github repository

`Githubdocs` reads the files from the remote repository, it then polls the repository intermittently for changes and updates the website automatically.

See [config](/#configuration) for setup.

---

##### Using local Markdown files

`Githubdocs` builds static files using the files supplied in the configuration file. Each file is then used to build the Single page application. When changes are made you can simple restart the website and it will be automatically updated.

---

##### Search

Search is built using [Lunr.js](https://github.com/olivernn/lunr.js/). The index is built and stored in memory on startup. When searched from the client the API is called returning any matching docs. The menu will then display the matched docs. When the search term is removed, the full list of docs is returned.