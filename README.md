# metalsmith-ssgs

A static site generator based in [metalsmith][1] and a collection of plugins I use for my own purposes.

**TODO**: I should write a good documentation, these instructions only reflect the very basic usage.

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
        compress: true,                         // Compress files (HTML, CSS, Javascript)
        baseUrl: '//localhost',                 // Your site base URL
        source: '/www/src',                     // Where to find the markdown sources
        layouts: '/www/templates',              // Where to find the layouts
        defaultLayout: 'main.hbs',              // The default layout file name
        partials: '/www/templates/partials',    // Where to find the partials
        bundles: '/www/bundles',                // Where to find the bundles
        output: '/www/public',                  // Where to write the resulting HTML
        exclude: [ 'draft' ],                   // Tags to exclude during the build process
        config: 'ssgs.production.json',         // Used as an application parameter will read settings from that file
    }

    # This example will use the settings stored in ssgs.devel.json and overwrite the --watch option
    $ ssgs --config ssgs.devel.json --watch true

These options can be saved to a file named *ssgs.ENVIRONMENT.json*, where *ENVIRONMENT* is that you would use as the value for *NODE_ENV*, and *ssgs* will read them automatically.

Under the directory specified in *source* is where your markdown files are expected to be found, and building the site would be as easy as:

    $ [NODE_ENV=production] [DEBUG=metalsmith*] ssgs

The output HTML will be saved under the directory indicated in *output*.

## License

MIT License, see [LICENSE][2] for details.


[1]: https://metalsmith.io/
[2]: https://gitlab.com/ahdiaz/metalsmith-ssgs/-/blob/master/LICENSE.md