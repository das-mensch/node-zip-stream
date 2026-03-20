import { ZipFileReadStream, ZipStreamOptions } from '../../src/StreamImpl';

export type ZipFile = {
  name: string,
  method: string,
  content: string
};

export const zipReader = (
  fileName: string,
  options?: ZipStreamOptions
): Promise<ZipFile[]> => {
  return new Promise((res, rej) => {
    const zipStream = new ZipFileReadStream(fileName, options);
    const files: ZipFile[] = [];
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
  });
};
