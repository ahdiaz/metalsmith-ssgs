
## Docker

This is the recommended way to run ahdiaz-ssgs:

```bash

docker run --rm -it --name ssgs-test-5 -v /Users/ahernandez/dev/euler/metalsmith-ssgs:/ssgs -v /Users/ahernandez/dev/euler/ahdiaz.euler.es:/www -w /ssgs -p 9000:9000 node:5.9.1-wheezy bash

```

## Installing

Install the dependencies and patch the modules:

```bash

$ npm install
$ npm patch.js

```

## Building a site:

```bash

$ DEBUG=metalsmith* [ENV=prod] node ssgs.js --config /www/ssgs.json --server

```
