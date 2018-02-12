# node-zip-stream
Add zip-file streaming possibility

This is the implementation of a very simple ZipStreamReader. Whenever you are facing the situation to read multiple files from a given zip file this simple stream will help you.

## Installation
```npm i --save node-zip-stream```

## Usage
A simple example might be:
```
const ZipFileReadStream = require('node-zip-stream');
...
try {
    const zipStream = new ZipFileReadStream('some-file.zip');
    zipStream.on('data', file => {
        console.log(`File ${file.metaInfo.fileName} has content '${file.content.toString()}'.`);
    });
    zipStream.on('end', () => {
        console.log('Reading finished');
    });
} catch (err) {
    console.error(err);
}

```

## Notice
- Please be aware of that the data event will give you the file contents as a buffer. You might want to use **toString(encoding)** to get the contents.
- You should not stream big files through this stream as it will get the contents on a per file basis, but multiple little files should work quite okay.
- Multipart zip archives are not supported

## Roadmap
### 1.1.0
- Add the possibility to give back the file contents as streams to process bigger files more easily (configurable, automatic by size limit)?
