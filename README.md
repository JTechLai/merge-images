# merge-images

> Easily composite images, no need to scribble on a canvas, can be used on webWorker

<!-- [![Build Status](https://travis-ci.org/JTechLai/merge-images.svg?branch=master)](https://travis-ci.org/JTechLai/merge-images)
[![Coverage Status](https://coveralls.io/repos/github/JTechLai/merge-images/badge.svg?branch=master)](https://coveralls.io/github/JTechLai/merge-images?branch=master)
[![npm](https://img.shields.io/npm/dm/JTechLai/merge-images.svg)](https://www.npmjs.com/package/JTechLai/merge-images)
[![npm](https://img.shields.io/npm/v/JTechLai/merge-images.svg)](https://www.npmjs.com/package/JTechLai/merge-images) -->

<!-- [![GitHub Donate](https://badgen.net/badge/GitHub/Sponsor/D959A7?icon=github)](https://github.com/sponsors/JTechLai)
[![Bitcoin Donate](https://badgen.net/badge/Bitcoin/Donate/F19537?icon=bitcoin)](https://lu.ke/tip/bitcoin)
[![Lightning Donate](https://badgen.net/badge/Lightning/Donate/F6BC41?icon=bitcoin-lightning)](https://lu.ke/tip/lightning) -->

Using a canvas can sometimes be troublesome, especially when you only need to do some relatively simple tasks in the canvas context, like merging several images together. `merge-images` abstracts all the repetitive tasks into a single function call.

Images can be overlaid on each other and repositioned. The function returns a Promise, resolving to a base64 URI, Blob, or Blob URL. It supports both the browser and Node.js. When used in a browser, rendering tasks can be assigned to a web worker, improving rendering performance and preventing the main thread from being blocked and unresponsive during rendering.

## Install

```shell
npm install --save @jtechlai/merge-images
```

or for quick testing:

```html
<script src="https://unpkg.com/jtechlai/merge-images"></script>
```

## Usage

With the following images:

| `body.png`                                         | `eyes.png`                                         | `mouth.png`                                         |
| -------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------- |
| <img src="./examples/images/body.png" width="128"> | <img src="./examples/images/eyes.png" width="128"> | <img src="./examples/images/mouth.png" width="128"> |

You can do:

### default use

```js
import mergeImages from "merge-images";
// base64
mergeImages(["/body.png", "/eyes.png", "/mouth.png"]).then((b64) => (document.querySelector("img").src = b64));

// blob
mergeImages(["/body.png", "/eyes.png", "/mouth.png"], { outFormat: "blob" }).then(
  (blob) => (/*...blob*/)
);
// {data: ...., type: "image/png"}

// blob url
mergeImages(["/body.png", "/eyes.png", "/mouth.png"], { outFormat: "blob-url" }).then(
  (blobUrl) => (document.querySelector("img").src = blobUrl)
);
// blob:https://domain...
```

And that would update the `img` element to show this image:

<img src="./examples/images/face.png" width="128">

### Positioning

Those source png images were already the right dimensions to be overlaid on top of each other. You can also supply an array of objects with x/y co-ords to manually position each image:

```js
mergeImages([
  { src: 'body.png', x: 0, y: 0 },
  { src: 'eyes.png', x: 32, y: 0 },
  { src: 'mouth.png', x: 16, y: 0 }
])
  .then(b64 => ...);
  // data:image/png;base64,iVBORw0KGgoAA...
```

Using the same source images as above would output this:

<img src="./examples/images/face-custom-positions.png" width="128">

### Opacity

The opacity can also be tweaked on each image.

```js
mergeImages([
  { src: 'body.png' },
  { src: 'eyes.png', opacity: 0.7 },
  { src: 'mouth.png', opacity: 0.3 }
])
  .then(b64 => ...);
  // data:image/png;base64,iVBORw0KGgoAA...
```

<img src="./examples/images/face-custom-opacity.png" width="128">

### Dimensions

By default the new image dimensions will be set to the width of the widest source image and the height of the tallest source image. You can manually specify your own dimensions in the options object:

```js
mergeImages(['/body.png', '/eyes.png', '/mouth.png'], {
  width: 128,
  height: 128
})
  .then(b64 => ...);
  // data:image/png;base64,iVBORw0KGgoAA...
```

Which will look like this:

<img src="./examples/images/face-custom-dimension.png" width="64">

## Node.js Usage

Usage in Node.js is the same, however you'll need to also require [node-canvas](https://github.com/Automattic/node-canvas) and pass it in via the options object.

```js
const mergeImages = require('merge-images');
const { Canvas, Image } = require('canvas');

mergeImages(['./body.png', './eyes.png', './mouth.png'], {
  Canvas: Canvas,
  Image: Image
})
  .then(b64 => ...);
  // data:image/png;base64,iVBORw0KGgoAA...
```

One thing to note is that you need to provide a valid image source for the node-canvas `Image` rather than a DOM `Image`. Notice the above example uses a file path, not a relative URL like the other examples. Check the [node-canvas docs](https://github.com/Automattic/node-canvas) for more information on valid `Image` sources.

## webWorker Usage

```js
const mergeImages = require('merge-images');

mergeImages(['./examples/images/body.png', './examples/images/eyes.png', './examples/images/mouth.png'], {
  worker: true
})
  .then(b64 => ...);
  // data:image/png;base64,iVBORw0KGgoAA...
```

One thing to note is that you need to provide a valid image source for `Image`. Note that you need to use a file path, not a relative URL as in the example.

validity: `https://xxx.xxx.xxx/images.png`✅<br/>
invalidity: `./examples/images/images.png`❌

## API

### mergeImages(images, [options])

Returns a Promise which resolves to a base64 data URI

#### images

Type: `array`<br>
Default: `[]`

Array of valid image sources for `new Image()`.<br>
Alternatively an [array of objects](#positioning) with `x`/`y` co-ords and `src` property with a valid image source.

#### options

Type: `object`

##### options.format

Type: `'image/png'` | `'image/jpeg'` | `'image/webp'`<br>
Default: `'image/png'`<br>

A DOMString indicating the image format.

##### options.quality

Type: `number`<br>
Default: `0.92`<br>
Options: 0 ~ 1

A number between 0 and 1 indicating image quality if the requested format is image/jpeg or image/webp.

##### options.width

Type: `number`<br>
Default: `undefined`

The width in pixels the rendered image should be. Defaults to the width of the widest source image.

##### options.height

Type: `number`<br>
Default: `undefined`

The height in pixels the rendered image should be. Defaults to the height of the tallest source image.

##### options.background

Type: `string`<br>
Default: `#ffffff`

Renders the background of the image. Defaults to `#ffffff` background, background is invalid when `format` is `image/png`

##### options.Canvas

Type: `Canvas`<br>
Default: `undefined`

Canvas implementation to be used to allow usage outside of the browser. e.g Node.js with node-canvas.

##### options.Image

Type: `Image`<br>
Default: `undefined`

Image implementation to be used to allow usage outside of the browser. e.g Node.js with node-canvas.

##### options.worker

Type: `boolean`<br>
Default: `true`

Whether or not to use `webWorker` for the rendering process, note that you need to use `new Worker()` to call the use by yourself, check the `examples` catalog for examples.

##### options.outFormat

Type: `"blob" | "blob-url" | "base64"`<br>
Default: `base64`

Output image format, default has `"blob" | "blob-url" | "base64"`, use `blob` format, need to then convert to `img` readable format.

##### options.crossOrigin

Type: "anonymous" | "use-credentials" | "" | undefined<br>
Default: `undefined`<br>

The `crossOrigin` attribute that `Image` instances should use. e.g `Anonymous` to [support CORS-enabled images](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image).

## License

MIT © JTechLai
