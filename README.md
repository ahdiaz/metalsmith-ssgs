# metalsmith-ssgs

A static site generator based in metalsmith and a collection of plugins I use for my own purposes.

## Installation

```
$ npm install metalsmith-ssgs
$ npm run patch
```

The second comman will patch metalsmith-permalink, this will fix some issues applying
date patterns and additionally will add some other features.
TODO: Explain what features.

## Usage

### Building a site:

```bash

$ DEBUG=metalsmith* [ENV=prod] node ssgs.js --config /www/ssgs.json --server

```

## License

MIT License, see [LICENSE](https://github.com/ahdiaz/metalsmith-ssgs/blob/master/LICENSE.md) for details.
