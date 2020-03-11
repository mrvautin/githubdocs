### How it works?

##### Using a Github repository

`Githubdocs` reads the files from the remote repository, it then polls the repository intermittently for changes and updates the website automatically.

See [config](/#configuration) for setup.

---

##### Using local Markdown files

`Githubdocs` builds using files supplied `/docs` folder. Each file is then indexed to build the Single page application. When changes are made you can simple restart the website and it will be automatically updated or use the scheduler.

---

##### Search

Search is built using [js-search](https://github.com/bvaughn/js-search). The index is built and stored in memory on startup. When searched from the client the API is called returning any matching docs. The menu will then display the matching docs. When the search term is removed, the full list of docs is returned.

##### Ordering

You can easily order your docs by naming the files with a `~` followed by the number order. Eg: A file name for the first file would be `~1 First file` then a second file `~2 Second file` etc. You can see an example in the `/docs` folder. Any numbering of files is stripped before indexing and display.