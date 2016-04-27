# trbl-evergreen-mongo

Evergreen Mongo Branch Source Directive.

![Build Status](https://circleci.com/gh/the-terribles/evergreen-mongo.svg?style=shield&circle-token=:circle-token)

### What does that even mean?

Simply, that the content of a branch (e.g. `foo.bar` in `{ foo: { bar: '...' }}` will be replaced with content from MongoDB).  For example:

```javascript
{
  foo: {
    bar: '$mongo:collection/{_id:"507f191e810c19729de860ea"}'
  }
}
```

Would get replaced with the first record matching that query:

```javascript
{
  foo: {
    bar: {
      _id: '507f191e810c19729de860ea',
      host: 'localhost',
      port: 23423
    }
  }
}
```

To use the module, simply register it with Evergreen.

```
npm i --save trbl-evergreen-mongo
```

```
require('trbl-evergreen')
  .addModule(require('trbl-evergreen-mongo'))
  .render(tree)
  .and()
  .then(function(config){
    // do something with the config.
});
```

### Wait!  How did the plugin know which Mongo to log into?

Simplest way is to set environment variables:

```
EV_MONGO_URI=mongo://user:password@123.45.67.89/database
```

### That's it.

Nothing else to see here.  Issues and PR's are welcome.

## License

The MIT License (MIT)

Copyright (c) 2016 The Terribles

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
