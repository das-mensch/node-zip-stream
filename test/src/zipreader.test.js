const assert = require('assert');
const { describe, it } = require("mocha");

const zipReader = require('./helper');

describe('ZipReadStream', () => {
    describe('Reading', () => {
        it('#single uncompressed file', async () => {
            const files = await zipReader('./test/resources/single-file.zip');
            assert.equal(files.length, 1);
            assert.equal(files[0].name, 'test.txt');
            assert.equal(files[0].method, 'STORE');
            assert.equal(files[0].content, `Hallo\n`);
        });

        it('#multiple compressed files', async () => {
            const files = await zipReader('./test/resources/multiple-files.zip');
            assert.equal(files.length, 3);
            assert.equal(files[0].name, 'lorem_1.txt');
            assert.equal(files[0].method, 'DEFLATE');
            assert.equal(files[0].content.startsWith('Lorem ipsum'), true);
            assert.equal(files[1].name, 'lorem_2.txt');
            assert.equal(files[1].method, 'DEFLATE');
            assert.equal(files[1].content.startsWith('Lorem ipsum'), true);
            assert.equal(files[2].name, 'lorem_3.txt');
            assert.equal(files[2].method, 'DEFLATE');
            assert.equal(files[2].content.startsWith('Lorem ipsum'), true);
        });
    });

    describe('Errors', () => {
        it('#method not DEFLATE or STORE', async () => {
            try {
                await zipReader('./test/resources/unknown-compression-method.zip');
            } catch (e) {
                assert.equal(e.message, `Unsupported compression method for file 'lorem_1.txt'`);
            }
        });

        it('#file does not exist', async () => {
            try {
                await zipReader('./test/resources/not-existing.zip');
            } catch (e) {
                assert.equal(e.message, './test/resources/not-existing.zip does not exist.');
            }
        });

        it('#file is not a valid zip', async () => {
            try {
                await zipReader('./test/resources/not-a-zip-file.zip');
            } catch (e) {
                assert.equal(e.message, './test/resources/not-a-zip-file.zip is not a valid zip file or empty.');
            }
        });
    });
});
