# metalsmith-ssgs

A static site generator based in metalsmith and a collection of plugins I use for my own purposes.

TODO: Expand and update this docs.

## Installation

```
$ npm install -g metalsmith-ssgs
$ npm run patch
```

The second comman will patch metalsmith-permalink, this will fix some issues applying
date patterns and additionally will add some other features.

## Usage

### Building a site:

```bash

$ [NODE_ENV=production] [DEBUG=metalsmith*] ssgs

# options
{
  server: false,
  host: '0.0.0.0',
  port: 9000,
  watch: false,
  compress: true,
  base_url: '//localhost',
  source: '/www/src',
  layouts: '/www/templates',
  partials: '/www/templates/partials',
  bundles: '/www/bundles',
  output: '/www/public',
  exclude: [ 'draft' ],
  config: 'ssgs.production.json',
}

```

## License

MIT License, see [LICENSE](https://github.com/ahdiaz/metalsmith-ssgs/blob/master/LICENSE.md) for details.
