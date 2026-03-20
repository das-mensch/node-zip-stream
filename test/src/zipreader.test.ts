import { expect } from 'chai';
import { describe, it } from 'mocha';
import { ZipFileReadStream } from '../../src/StreamImpl';
import { zipReader } from './helper';

describe('ZipReadStream', () => {
  describe('Reading', () => {
    it('#single uncompressed file', async () => {
      const files = await zipReader('./test/resources/single-file.zip');
      expect(files.length).to.equal(1);
      expect(files[0].name).to.equal('test.txt');
      expect(files[0].method).to.equal('STORE');
      expect(files[0].content).to.equal(`Hallo\n`);
    });

    it('#multiple compressed files', async () => {
      const files = await zipReader('./test/resources/multiple-files.zip');
      expect(files.length).to.equal(3);
      expect(files[0].name).to.equal('lorem_1.txt');
      expect(files[0].method).to.equal('DEFLATE');
      expect(files[0].content).to.match(/^Lorem ipsum/);
      expect(files[1].name).to.equal('lorem_2.txt');
      expect(files[1].method).to.equal('DEFLATE');
      expect(files[1].content).to.match(/^Lorem ipsum/);
      expect(files[2].name).to.equal('lorem_3.txt');
      expect(files[2].method).to.equal('DEFLATE');
      expect(files[2].content).to.match(/^Lorem ipsum/);
    });

    it('#zip64 support', done => {
      const zipStream = new ZipFileReadStream('./test/resources/zip64_stored.zip');
      expect(zipStream.fileCount).to.equal(65537);
      let zipFile;
      zipStream.on('data', file => {
        zipFile = {
          name: file.metaInfo.fileName,
          method: file.metaInfo.cMethodName,
          content: file.content.toString()
        };
        zipStream.pause();
        expect(zipFile.name).to.equal('0.txt');
        expect(zipFile.method).to.equal('STORE');
        expect(zipFile.content).to.equal('Lorem Ipsum');
        done();
      });
    });

    it('#zip64 deflate support', done => {
      const zipStream = new ZipFileReadStream('./test/resources/zip64_deflate.zip');
      expect(zipStream.fileCount).to.equal(65537);
      let zipFile;
      zipStream.on('data', file => {
        zipFile = {
          name: file.metaInfo.fileName,
          method: file.metaInfo.cMethodName,
          content: file.content.toString()
        };
        zipStream.pause();
        expect(zipFile.name).to.equal('0.txt');
        expect(zipFile.method).to.equal('DEFLATE');
        expect(zipFile.content).to.match(/^Lorem ipsum/);
        done();
      });
    });

    it('#filter regex', async () => {
      const files = await zipReader('./test/resources/zip64_stored.zip', {
        filter: /^2(5|6).txt$/
      });
      expect(files.length).to.equal(2);
      expect(files[0].name).to.equal('25.txt');
      expect(files[0].method).to.equal('STORE');
      expect(files[0].content).to.equal('Lorem Ipsum');
      expect(files[1].name).to.equal('26.txt');
      expect(files[1].method).to.equal('STORE');
      expect(files[1].content).to.equal('Lorem Ipsum');
    });

    it('#filter string', async () => {
      const files = await zipReader('./test/resources/zip64_stored.zip', {
        filter: '25.txt'
      });
      expect(files.length).to.equal(1);
      expect(files[0].name).to.equal('25.txt');
      expect(files[0].method).to.equal('STORE');
      expect(files[0].content).to.equal('Lorem Ipsum');
    });

    it('#filter function', async () => {
      const files = await zipReader('./test/resources/zip64_stored.zip', {
        filter: (name) => ['25.txt', '183.txt'].includes(name)
      });
      expect(files.length).to.equal(2);
      expect(files[0].name).to.equal('183.txt');
      expect(files[0].method).to.equal('STORE');
      expect(files[0].content).to.equal('Lorem Ipsum');
      expect(files[1].name).to.equal('25.txt');
      expect(files[1].method).to.equal('STORE');
      expect(files[1].content).to.equal('Lorem Ipsum');
    });
  });

  describe('Errors', () => {
    it('#method not DEFLATE or STORE', async () => {
      try {
        await zipReader('./test/resources/unknown-compression-method.zip');
      } catch (e) {
        expect((e as Error).message).to.equal(`Unsupported compression method for file 'lorem_1.txt'`);
      }
    });

    it('#file does not exist', async () => {
      try {
        await zipReader('./test/resources/not-existing.zip');
      } catch (e) {
        expect((e as Error).message).to.equal('./test/resources/not-existing.zip does not exist.');
      }
    });

    it('#file is not a valid zip', async () => {
      try {
        await zipReader('./test/resources/not-a-zip-file.zip');
      } catch (e) {
        expect((e as Error).message).to.equal('./test/resources/not-a-zip-file.zip is not a valid zip file or empty.');
      }
    });
  });
});
