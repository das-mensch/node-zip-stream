# node-zip-streamer
Add zip-file streaming possibility

This is the implementation of a very simple ZipStreamReader. Whenever you are facing the situation to read multiple files from a given zip file this simple stream will help you.

Now with ZIP64 support.

## Installation
```npm i --save node-zip-streamer```

## Usage
A simple example might be:
```
const ZipFileReadStream = require('node-zip-streamer');
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

## Changes
### 1.0.2
- Fixed error due to checking on the wrong extraField length attribute. (offset was wrong when cdRecord extrafield-length had a different value than in the localfile-header)
- Added ZIP64 support. Archives with file count > 65535 are now possible to be extracted.

## Roadmap
### 1.1.0
- Add the possibility to give back the file contents as streams to process bigger files more easily (configurable, automatic by size limit)?
