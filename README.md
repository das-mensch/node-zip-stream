# node-zip-streamer
Add zip-file streaming possibility

This is the implementation of a very simple ZipStreamReader. Whenever you are facing the situation to read multiple files from a given zip file this simple stream will help you.

Now with ZIP64 support.

## Installation
```npm i node-zip-streamer```

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

// You might want to prefilter the files (new in 1.0.4)
// via RegEx...
const zipStream = new ZipFileReadStream(
  'some-file.zip',
  { filter: /by-regex/ }
);
// via exact file name...
const zipStream = new ZipFileReadStream(
  'some-file.zip',
  { filter: 'exact-match.txt' }
);
// via your own custom function (should return boolean true to mark a match)...
const zipStream = new ZipFileReadStream(
  'some-file.zip',
  { filter: (fileName) => fileName.startsWith('a') }
);
```

## Notice
- Please be aware of that the data event will give you the file contents as a buffer. You might want to use **toString(encoding)** to get the contents.
- You should not stream zip archives containing big files through this stream as it will get the contents on a per file basis, but multiple little files should work quite fine.
- Multipart zip archives are not supported

## Changes
### 1.0.4
- Added possibility to pre-filter files by function, regex or string

### 1.0.3
- Fixed error while reading Zip64-Records due to wrong usage of readUint

### 1.0.2
- Fixed error due to checking on the wrong extraField length attribute. (offset was wrong when cdRecord extrafield-length had a different value than in the localfile-header)
- Added ZIP64 support. Archives with file count > 65535 are now possible to be extracted.

## Roadmap
### 1.1.0
- Add the possibility to give back the file contents as streams to process bigger files more easily (configurable, automatic by size limit)?
