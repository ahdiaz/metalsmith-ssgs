# Getting started

The most simple structure that you need is

    + My site/
    |
    +--- src/
    |    |
    |    +--- index.md
    |
    +--- layouts/
    |    |
    |    +--- main.hbs
    |
    +--- public
         |
         +--- index/
              |
              +--- index.html

That includes default values so just running *ssgs* will generate the output *public/index/index.html*. You might expect it to be *public/index.html*, but for this is needed to adjust permalinks, continue reading.

## Directory layout

### Assets

Basically, every non markdown file will be copied to the output directory untouched, so you can create your own assets directory tree.

    + My site/
    |
    +--- src/assets/
    |    |
    |    +--- css/...
    |    |
    |    +--- js/...
    |    |
    |    +--- img/...
    |
    +--- public/assets/
         |
         +--- css/...
         |
         +--- js/...
         |
         +--- img/...

### Subfolders

For markdown files the directory layout is also reproduced, the only difference is that permalinks will add an extra directory named as the file at the end of the path. This allows you to group your URLS.

    + My site/
    |
    +--- src/
    |    |
    |    +--- blues/
    |    |    |
    |    |    +--- johnny-winter.md
    |    |    |
    |    |    +--- muddy-waters.md
    |    |
    |    +--- rock/
    |         |
    |         +--- deep-purple.md
    |         |
    |         +--- led-zeppelin.md
    |
    +--- public/
         |
         +--- blues/
         |    |
         |    +--- johnny-winter/
         |    |    |
         |    |    +--- index.html
         |    |
         |    +--- muddy-waters/
         |         |
         |         +--- index.html
         |
         +--- rock/
              |
              +--- deep-purple/
              |    |
              |    +--- index.html
              |
              +--- led-zeppelin/
                   |
                   +--- index.html

Of course is possible to combine subfolders and assets:

    + My site/
    |
    +--- src/
    |    |
    |    +--- blues/
    |         |
    |         +--- johnny-winter/
    |              |
    |              +--- index.md
    |              |
    |              +--- img/
    |                   |
    |                   +--- ...
    |
    +--- public/
         |
         +--- blues/
              |
              +--- johnny-winter/
                   |
                   +--- index.html
                   |
                   +--- img/
                        |
                        +--- ...

## Variables

Global variables can be set in the file *metadata.json* in the root of your project, [metalsmith-define][metalsmith-define] will make them available in the templates and markdown files through the object *metadata*. There is no requirement on how you organize the structure of this file.

Additionally to the variables you define globally, the configuration and the environment are also exposed through *config* and *env*.

Page variables are defined in the front matter of each markdown file. Some variable names have special meaning as they are used by some plugins.

It is important to highlight that variables are substituted in two phases, the first one before processing markdown and the second one when templates are processed by Handlebars. Thanks to [metalsmith-hbt-md][metalsmith-hbt-md] the source files are processed with Handlebars before they are transformed to HTML, otherwise the Handlebars expressions are removed and will never be accessible in the templates.

The following variables are optional and are controlled by their respective plugins.

### `layout`

Indicates the layout that must be used to process a page.

    ---
    layout: post.hbs
    ---

### `permalink`

By default [metalsmith-permalinks][metalsmith-permalinks] will rename the final pages so *about.md* will result in *about/index.html*. You can avoid this behaviour by settings *permalink* to FALSE, in this case the previous example will result in *about.html*. This can be useful for some pages like *index.html* or perhaps *404.html* as they will remain at the root of the directory tree.

    ---
    permalink: false
    ---

Additionally a pattern can be specified and [metalsmith-permalinks][metalsmith-permalinks] will apply it to a specific page:

    ---
    permalink: 'blog/:date/:filebasename.html'
    ---

### `tags`

Tags can be used for several things, the main purpose is that of [metalsmith-tags][metalsmith-tags], to create dedicated pages for tags. The layout to use is named by default as *tags.hbs* and the resulted pages will be structured under the directory *public/tags/*.

Another use is to exclude pages from being processed. This can be useful when a page is still a draft and you want to see it in your development environment but don't want it to be deployed in production. [metalsmith-excludes][metalsmith-excludes] will take care of it.

    ---
    tags: [ blues, rock, draft ]
    ---

## Handlebars helpers

These helpers can be used in templates or markdown files.

### `url`

Will compose an absolute URL using the specified base URL.

    {{ url '/some/path' }}

### `formatDate`

Formats a date using [moment.js][momentjs].

    {{ formatDate '2020-09-24' 'MMM Do, YYYY' }}

### `hasTag`

Returns TRUE if the current page has a specific tag.

    {{#hasTag 'draft'}}
        <p>This is a draft</p>
    {{/hasTag}}


[metalsmith-hbt-md]: https://www.npmjs.com/package/metalsmith-hbt-md
[metalsmith-define]: https://www.npmjs.com/package/metalsmith-define
[metalsmith-permalinks]: https://www.npmjs.com/package/@metalsmith/permalinks
[metalsmith-tags]: https://www.npmjs.com/package/metalsmith-tags
[metalsmith-excludes]: https://www.npmjs.com/package/metalsmith-excludes
[momentjs]: https://momentjs.com/