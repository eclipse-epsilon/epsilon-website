# Manage the Epsilon web site locally

This article provides a step-by-step guide for obtaining a local copy of the Epsilon website. The website is managed using the [mkdocs](https://www.mkdocs.org/) library. The content is organised in different Markdown files, from which a static website can be generated.

## Setting up your environment

- Clone the Git repository at [https://github.com/eclipse-epsilon/epsilon-website](https://github.com/eclipse-epsilon/epsilon-website).
- Download and install [virtualenv](https://virtualenv.pypa.io/en/stable/installation.html).
- Navigate to the `mkdocs` folder, and run `./serve.sh` from a terminal. The first time this command is run, a Python virtual environment will be created unther the `mkdocs/env` directory. After the environment is ready (and on subsequent calls to `./serve.sh`), a local web server containing the Epsilon website will be running at [http://localhost:8000](http://localhost:8000).

## Real-time modification of the website

All the Markdown sources of the website are contained in the `mkdocs` folder. After running the `./serve.sh` command, we can alter these sources, and the changes will be reflected automatically in the local website. This is very useful to get quick feedback of our changes, as we do not have to regenerate the website each time we make a modification.

To shutdown the local web server at any time, hit `CTRL + C` on the terminal you used to launch it in the first place.

## Building the static site

Once you've happy with the changes you've made to the Markdown sources, you can re-generate the static website. To do so, run `./build.sh` and wait for it to finish.

## Updating the website contents

As a convention for project commiters, introducing a change in the website is usually separated in two commits: the first one contains any changes to the Markdown sources, while the second one includes the result of building again the static site as described in the previous section. 

If you modify any of the JavaScript code of the website, you will also need to use `webpack` to compile your code into a `bundle.js`, as discussed in the `README.md` files of the [main website](https://github.com/eclipse-epsilon/epsilon-website/blob/main/mkdocs/docs/assets/readme.md) and the [Playground](https://github.com/eclipse-epsilon/epsilon-website/blob/main/mkdocs/docs/playground/readme.md).

If you are not a commiter, but you find any typos or parts of the website that do not work as they should, thanks for [letting us know](https://github.com/eclipse-epsilon/epsilon/issues)!

## Pushing your changes

There is a `publish.sh` script in the repo, which creates separate commits for the changes to `mkdocs` and the changes to the generated static files, and then pushes both commits to the remote repo. You can use it as follows: `./publish.sh "Added new article"`.

## Finding broken links

`wget` and `grep` can be used to find broken links in the Epsilon website. First, run the website locally by executing the `./serve.sh` command as described above. Then, we will traverse the website using `wget` with this command:

```
wget -e robots=off --spider -r --no-parent -o wget_errors.txt http://localhost:8000
```

We have used these options:

- `-e robots=off` makes `wget` ignore `robots.txt`. This is OK in this case, as we're running the spider on our own local server.
- `--spider` prevents `wget` from downloading page requisites that do not contain links
- `-r` makes `wget` traverse through links
- `--no-parent` prevents `wget` from leaving `/gmt/epsilon/`
- `-o wget_errors.txt` collects all messages in the `wget_errors.txt` file

Once it's done, we can simply search for the word "404" in the log, with:

```
grep -B2 -w 404 wget_errors.txt
```

We will get a list of all the URLs which reported 404 (Not Found) HTTP error codes.
