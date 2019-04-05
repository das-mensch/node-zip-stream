const ZipFileReadStream = require('../../index');

module.exports = async (fileName, options) => {
  return new Promise((res, rej) => {
    const zipStream = new ZipFileReadStream(fileName, options);
    let files = [];
    zipStream.on('data', data => {
      files.push({
        name: data.metaInfo.fileName,
        method: data.metaInfo.cMethodName,
        content: data.content.toString()
      });
    });
    zipStream.on('end', () => {
      res(files);
    });
    zipStream.on('error', error => {
      rej(error);
    });
  })
};
