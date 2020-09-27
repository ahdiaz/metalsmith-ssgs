# metalsmith-ssgs

A static site generator based in [metalsmith][metalsmith] and a collection of plugins I use for my own purposes.

This project is a wrapper around a set of plugins I use often, the credits goes to the developers of metalsmith and its plugins.
My only target is to compile the functionality I usually need and create a basic framework that allows to set up a site easily.

The page sources are expected to be markdown files and the templates use handlebars.

## Usage

Installing it globally is the preferred way:

    $ npm install -g metalsmith-ssgs
    $ [NODE_ENV=production] [DEBUG=metalsmith*] ssgs [options]

Please refer to the full documentation: <https://metalsmith-ssgs.readthedocs.io>.

## License

[MIT License][license]. Copyright © 2016 Antonio Hernandez \<ahdiaz@gmail.com\>.


[metalsmith]: https://metalsmith.io/
[license]: https://gitlab.com/ahdiaz/metalsmith-ssgs/-/blob/master/LICENSE.md