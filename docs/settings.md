# Settings

The executable accepts several parameters that controls the behavior of ssgs. These parameters can be written to a json file to make easy to reproduce the build in different environments. The default environment if no other is specified is *local*, so ssgs will look for a file named *ssgs.local.json*. If you specify other environment like this *NODE_ENV=ENVIRONMENT* the corresponding file will be *ssgs.ENVIRONMENT.json*.

Another way to indicate the configuration file to use is by passing the parameter *--config*. It accepts an absolute or relative path:

    $ ssgs --config=/path/to/config.json

Even when a configuration file is used, is still possible to overwrite options from the command line:

    $ ssgs --config=/path/to/config.json --baseUrl=http://mysite.localhost

## Plugins settings

In the configuration file is possible to specify options that will be passed to certain plugins:

    {
        plugins: {

            collections: {},

            permalinks: {
                indexFile: 'index.html',
                relative: false
            }
        }
    }

## Parameters

### `server`

Starts a development server. Defaults to *false*.

### `host`

IP address the development server should listen on. Defaults to *'0.0.0.0'*.

### `port`

The port the development server should listen on. Defaults to *9000*.

### `watch`

Watch for changes in the sources and rebuild the site automatically. Defaults to *false*.

### `compress`

Compress files (HTML, CSS, Javascript). Defaults to *false*.

### `baseUrl`

Your site base URL. Defaults to *'//localhost'*.

### `source`

Where to find the markdown sources. Defaults to *'./src'*.

### `layouts`

Where to find the layouts. Defaults to *'./layouts'*.

### `defaultLayout`

The default layout file name. Defaults to *'main.hbs'*.

### `tagsLayout`

The default layout file name for the tags list page. Defaults to *'tags.hbs'*.

### `partials`

Where to find the partials. Defaults to *'./layouts/partials'*.

### `bundles`

Where to find the bundles. Defaults to *'./bundles'*.

### `output`

Where to write the resulting HTML. Defaults to *'./public'*.

### `exclude`

Pages with these tags will be excluded from the processing. Defaults to *[ 'draft' ]*.
