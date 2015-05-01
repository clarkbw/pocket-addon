# pocket-addon
A Firefox add-on for testing Pocket built with the [mozilla add-on sdk, jpm](https://github.com/mozilla/jpm/)

## Setup

You need the JPM module which available via [npm](http://npmjs.com/).

```
  npm -g install jpm
  npm install
  gulp
```

## Development

Use the npm commands.

```
  npm start
```

Similarly you could also use the JPM commands directly:

```
  jpm run -b nightly
```

## Test

```
  npm test
```

```
  jpm test
```

[![Build Status](https://travis-ci.org/clarkbw/pocket-addon.svg)](https://travis-ci.org/clarkbw/pocket-addon)
