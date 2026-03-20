import fs from 'fs';
import zlib from 'zlib';
import { Readable } from 'stream';
import {
  CdRecord,
  EocdRecord,
  Zip64CdLocatorRecord,
  Zip64EocdRecord,
  LocalFileHeader
} from './records';
const ZIP_MAGIC_NUMBER = 0x04034b50;

export type ZipStreamOptions = {
  filter?: string | RegExp | ((fileName: string) => boolean) | null
}

export class ZipFileReadStream extends Readable {
  private _options: ZipStreamOptions;
  private _eocdRecord: EocdRecord | Zip64EocdRecord;
  private _filesPushed = 0;
  private _cdBuffer: Buffer;
  private _fd: number;
  private _cdRecords: CdRecord[] = [];
  private _fileSize = 0;
  private _filesToSend: number;

  constructor(
    private _filePath: string,
    options?: ZipStreamOptions
  ) {
    super({
      objectMode: true
    });
    this._options = options || { filter: null };
    this.checkPreConditions();
    this.readMetaInformation();
    this.preFilterFiles();
    this._filesToSend = this._cdRecords.length;
  }

  get fileCount() {
    return this._cdRecords.length;
  }

  checkPreConditions() {
    if (!fs.existsSync(this._filePath)) {
      throw new Error(`${this._filePath} does not exist.`);
    }
    const fileStats = fs.statSync(this._filePath);
    if (!fileStats || !fileStats.size) {
      throw new Error(`Unable to get file stats of ${this._filePath}.`);
    }
    this._fileSize = fileStats.size;
    this._fd = fs.openSync(this._filePath, 'r');
    const magicNumberBuffer = Buffer.alloc(4);
    fs.readSync(this._fd, magicNumberBuffer, 0, 4, 0);
    if (magicNumberBuffer.readUInt32LE(0) !== ZIP_MAGIC_NUMBER) {
      fs.closeSync(this._fd);
      throw new Error(`${this._filePath} is not a valid zip file or empty.`);
    }
  }

  readMetaInformation() {
    const eocdMagicNumberBuffer = Buffer.alloc(4, 0);
    let startPosition = this._fileSize - 20;
    while (startPosition > 0 && eocdMagicNumberBuffer.readUInt32LE(0) !== EocdRecord.MAGIC_NUMBER()) {
      fs.readSync(this._fd, eocdMagicNumberBuffer, 0, 4, startPosition--);
    }
    startPosition++;
    if (eocdMagicNumberBuffer.readUInt32LE(0) !== EocdRecord.MAGIC_NUMBER()) {
      fs.closeSync(this._fd);
      throw new Error('Could not find EOCD record.');
    }
    const zip64LocatorBuffer = Buffer.alloc(20);
    fs.readSync(this._fd, zip64LocatorBuffer, 0, zip64LocatorBuffer.length, startPosition - 20);
    const zip64LocatorRecord = Zip64CdLocatorRecord.fromBuffer(zip64LocatorBuffer);
    if (zip64LocatorRecord.magicNumber === Zip64CdLocatorRecord.MAGIC_NUMBER()) {
      const zip64EocdBuffer = Buffer.alloc(56);
      fs.readSync(this._fd, zip64EocdBuffer, 0, zip64EocdBuffer.length, zip64LocatorRecord.cdOffset);
      const zip64EoCdRecord = Zip64EocdRecord.fromBuffer(zip64EocdBuffer);
      if (zip64EoCdRecord.magicNumber !== Zip64EocdRecord.MAGIC_NUMBER()) {
        fs.closeSync(this._fd);
        throw new Error('Could not find ZIP64 EOCD record');
      }
      this._eocdRecord = zip64EoCdRecord;
      this._cdBuffer = Buffer.alloc(zip64EoCdRecord.cdSize);
      fs.readSync(this._fd, this._cdBuffer, 0, this._cdBuffer.length, zip64EoCdRecord.cdOffset);
      this.splitCdBuffer();
      return;
    }
    const eocdBuffer = Buffer.alloc(this._fileSize - startPosition);
    fs.readSync(this._fd, eocdBuffer, 0, eocdBuffer.length, startPosition);
    this._eocdRecord = EocdRecord.fromBuffer(eocdBuffer);
    this._cdBuffer = Buffer.alloc(this._eocdRecord.cdSize);
    fs.readSync(this._fd, this._cdBuffer, 0, this._cdBuffer.length, this._eocdRecord.cdOffset);
    this.splitCdBuffer();
  }

  splitCdBuffer() {
    let offset = 0;
    let currentCdRecord;
    for (let i = 0; i < this._eocdRecord.cdCount; i++) {
      currentCdRecord = CdRecord.fromBuffer(this._cdBuffer.slice(offset));
      offset += currentCdRecord.recordSize;
      this._cdRecords.push(currentCdRecord);
    }
  }

  preFilterFiles() {
    const { filter } = this._options;
    if (!filter) {
      return;
    }
    this._cdRecords = this._cdRecords.filter(record => {
      if (filter instanceof RegExp) {
        return filter.test(record.fileName);
      }
      if (typeof filter === 'string') {
        return record.fileName === filter;
      }
      if (filter instanceof Function) {
        return filter(record.fileName);
      }
      return false;
    });
  }

  handlePostPush() {
    this._filesPushed++;
    if (this._filesToSend === this._filesPushed) {
      fs.closeSync(this._fd);
      this.push(null);
    }
  }

  _read() {
    if (this._filesToSend === this._filesPushed) {
      fs.closeSync(this._fd);
      this.push(null);
      return;
    }

    if (this._cdRecords.length < 1) {
      return;
    }
    const cdRecord = this._cdRecords.shift() as CdRecord;
    const metaInfo = {
      fileName: cdRecord.fileName,
      cMethodName: cdRecord.cMethodName
    };
    const localFileHeaderBuffer = Buffer.alloc(30);
    fs.readSync(this._fd, localFileHeaderBuffer, 0, 30, cdRecord.offset);
    const localFileHeader = LocalFileHeader.fromBuffer(localFileHeaderBuffer);
    const start = cdRecord.offset + localFileHeader.recordSize;
    const end = start + cdRecord.compressedSize - 1;
    if (cdRecord.cMethodName === 'OTHER') {
      process.nextTick(() => {
        this.emit('error', new Error(`Unsupported compression method for file '${cdRecord.fileName}'`));
      });
      return;
    }
    const fsStream = fs.createReadStream(
      this._filePath, {
        start: start,
        end: end,
      }
    );
    let data = Buffer.alloc(0);
    fsStream.on('data', chunk => {
      data = Buffer.concat([data, chunk as Buffer]);
    });
    fsStream.on('end', () => {
      if (cdRecord.cMethodName !== 'DEFLATE') {
        this.push({
          metaInfo,
          content: data
        });
        this.handlePostPush();
        return;
      }
      zlib.inflateRaw(data, (err, buffer) => {
        if (err) {
          process.nextTick(() => {
            this.emit('error', err);
          });
          return;
        }
        this.push({
          metaInfo,
          content: buffer
        });
        this.handlePostPush();
      });
    });
  }
}
