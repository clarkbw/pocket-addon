# pocket-addon
A Firefox add-on for testing Pocket built with the [mozilla add-on sdk](https://github.com/mozilla/addon-sdk/)

## Setup

You need the Mozilla Add-on SDK which is most easily available from [homebrew](http://brew.sh/) for Mac.

```
  brew install mozilla-addon-sdk
```

## Development

Assuming you have node installed you can use the npm commands, this is useful for travis testing but not required for development.

```
  npm start
```

Similarly you could also use the Mozilla Add-on SDK commands:

```
  cfx run
```

## Test

```
  npm test
```

```
  cfx test
```
