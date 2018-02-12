const fs = require('fs');
const zlib = require('zlib');
const { Readable } = require('stream');

const { CdRecord, EocdRecord } = require('./records');

module.exports = class ZipFileReadStream extends Readable {
    constructor(filePath, options) {
        if (!options) {
            options = { objectMode: true };
        } else {
            options.objectMode = true;
        }
        super(options);
        this._filePath = filePath;
        this.checkPreConditions();
        this._fileMetaInfos = this.readMetaInformation();
    }

    checkPreConditions() {
        if (!fs.existsSync(this._filePath)) {
            throw new Error(`${this._filePath} does not exist.`);
        }
        let fileStats = fs.statSync(this._filePath);
        if (!fileStats || !fileStats.size) {
            throw new Error(`Unable to get file stats of ${this._filePath}.`);
        }
        this._fileSize = fileStats.size;
        let fileResource = fs.openSync(this._filePath, 'r');
        let magicNumberBuffer = Buffer.alloc(4);
        fs.readSync(fileResource, magicNumberBuffer, 0, 4, 0);
        fs.closeSync(fileResource);
        if (magicNumberBuffer.readUInt32LE(0) !== 0x04034b50) {
            throw new Error(`${this._filePath} is not a valid zip file or empty.`);
        }
    }

    readMetaInformation() {
        let fileResource = fs.openSync(this._filePath, 'r');
        let magicNumberBuffer = Buffer.alloc(4, 0);
        let startPosition = this._fileSize - 20;
        while (startPosition > 0 && magicNumberBuffer.readUInt32LE(0) !== 0x06054b50) {
            fs.readSync(fileResource, magicNumberBuffer, 0, 4, startPosition--);
        }
        if (magicNumberBuffer.readUInt32LE(0) !== 0x06054b50) {
            throw new Error(`Could not find EOCD record.`);
        }
        let eocdBuffer = Buffer.alloc(this._fileSize - startPosition + 1);
        fs.readSync(fileResource, eocdBuffer, 0, eocdBuffer.length, startPosition + 1);
        const eocdRecord = EocdRecord.fromBuffer(eocdBuffer);
        let cdBuffer = Buffer.alloc(eocdRecord.cdSize);
        fs.readSync(fileResource, cdBuffer, 0, cdBuffer.length, eocdRecord.cdOffset);
        let cdRecord = CdRecord.fromBuffer(cdBuffer);
        let metaInfo = [cdRecord];
        let offset = cdRecord.recordSize;
        for (let i = 1; i < eocdRecord.cdCount; i++) {
            cdRecord = CdRecord.fromBuffer(cdBuffer.slice(offset));
            offset += cdRecord.recordSize;
            metaInfo.push(cdRecord);
        }
        fs.closeSync(fileResource);
        return metaInfo;
    }

    _read() {
        if (this._fileMetaInfos.length === 0) {
            this.push(null);
            return;
        }
        const currentFileInfo = this._fileMetaInfos.shift();
        if (currentFileInfo.cMethodName === 'OTHER') {
            process.nextTick(() => this.emit('error', new Error(`Unsupported compression method for file '${currentFileInfo.fileName}'`)));
            return;
        }
        let start = currentFileInfo.offset + 30 + currentFileInfo.fileName.length + currentFileInfo.extraField.length;
        let end = start + currentFileInfo.compressedSize - 1;
        let fsStream = fs.createReadStream(this._filePath, { start: start, end: end });
        let data = Buffer.alloc(0);
        fsStream.on('data', chunk => {
            data = Buffer.concat([data, chunk]);
        });
        fsStream.on('end', () => {
            if (currentFileInfo.cMethodName === 'DEFLATE') {
                this.push({ metaInfo: currentFileInfo, content: zlib.inflateRawSync(data) });
                return;
            }
            this.push({ metaInfo: currentFileInfo, content: data });
        });
    }
};
