# Plugins

This is a short description about the integration with some plugins. Refer to the plugin documentation for more information.

## Permalinks

Pass permalinks options to [metalsmith-permalinks][metalsmith-permalinks] through the ssgs configuration file. The defaults are the following:

    {
        plugins: {

            permalinks: {
                indexFile: 'index.html',
                relative: false
            }
        }
    }

### The blog example

If you want to build a blog, and you want your posts to be accessible through *http://localhost/blog/POST_DATE/POST_NAME.html* you could do the following.

First, tag your documents using a page variable:

    # first-post.md
    ---
    title: My first post
    collection: posts
    date: 2020-08-12
    ---

Be sure that your configuration contains a rule so that permalinks know how to transform that page:

    {
        plugins: {

            permalinks: {
                indexFile: 'index.html',
                relative: false,

                date: 'YYYY/MM/DD',

                linksets: [{
                    match: { collection: 'posts' },
                    pattern: 'blog/:date/:filebasename.html'
                }]
            }
        }
    }

The result should be something like this:

    + My site/
    |
    +--- public/
         |
         +--- blog/2020/08/12/
              |
              +--- first-post.html

metalsmith-ssgs defines the variable *filebasename* in the metadata so it can be used by permalinks.

## Collections

Following with the previous example, if you have many posts there is a better way to include them in the collection *posts*. With [metalsmith-collections][metalsmith-collections] is pretty easy.

First arrange your posts under a dedicated directory:

    + My site/
    |
    +--- src/
         |
         +--- posts/
              |
              +--- post1.md
              |
              +--- post2.md
              |
              +--- ...

Now pass the needed rules to the plugin in the ssgs configuration file using a pattern:

    {
        plugins: {

            collections: {
                posts: {
                    pattern: 'posts/*.md',
                    sortBy: 'date',
                    reverse: true
            }
        }
    }

That's it.

## Bundles

Coming soon...


[metalsmith-permalinks]: https://www.npmjs.com/package/@metalsmith/permalinks
[metalsmith-collections]: https://www.npmjs.com/package/metalsmith-collections
[metalsmith-bundles]: https://www.npmjs.com/package/metalsmith-bundles
