# Overview

A static site generator based in [metalsmith][metalsmith] and a collection of plugins I use for my own purposes.

This project is a wrapper around a set of plugins I use often, the credits goes to the developers of metalsmith and its plugins.
My only target is to compile the functionality I usually need and create a basic framework that allows to set up a site easily.

The page sources are expected to be markdown files and the templates use handlebars.

This software is provided with the hope that it will be useful for someone, but under no means it is consider to be finish, stable or free of bugs. Contributors are welcome, but please keep in mind that I might have not enough time to address filed issues or functionality requests.

## Installation

Installing it globally is the preferred way:

    $ npm install -g metalsmith-ssgs

## Usage

Several options can be provided to the executable:

    {
        server: false,                          // Starts a development server
        host: '0.0.0.0',                        // IP address the development server should listen on
        port: 9000,                             // The port the development server should listen on
        watch: false,                           // Watch for changes in the sources and rebuild the site automatically
        compress: false,                        // Compress files (HTML, CSS, Javascript)
        baseUrl: '//localhost',                 // Your site base URL
        source: './src',                        // Where to find the markdown sources
        layouts: './layouts',                   // Where to find the layouts
        defaultLayout: 'main.hbs',              // The default layout file name
        tagsLayout: 'tags.hbs',                 // The default layout file name for the tags list page
        partials: './layouts/partials',         // Where to find the partials
        bundles: './bundles',                   // Where to find the bundles
        output: './public',                     // Where to write the resulting HTML
        exclude: [ 'draft' ],                   // Tags to exclude during the build process
        plugins: {                              // Plugins specific options

            collections: {},

            permalinks: {
                indexFile: 'index.html',
                relative: false
            }
        },
        config: './ssgs.production.json',         // Used as command line parameter will read settings from that file
    }

    # This example will use the settings stored in ssgs.devel.json and overwrite the --watch option
    $ ssgs --config ssgs.devel.json --watch true

These options can be saved to a file named *ssgs.ENVIRONMENT.json*, where *ENVIRONMENT* is that you would use as the value for *NODE_ENV*, and *ssgs* will read them automatically.

Under the directory specified in *source* is where your markdown files are expected to be found, and building the site would be as easy as:

    $ [NODE_ENV=production] [DEBUG=metalsmith*] ssgs

The output HTML will be saved under the directory indicated in *output*.

## MIT License

Copyright © 2016 Antonio Hernandez &lt;ahdiaz@gmail.com&gt;.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



[metalsmith]: https://metalsmith.io/
