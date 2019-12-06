import { Readable, ReadableOptions } from 'stream';
import * as fs from 'fs';
import * as zlib from 'zlib';
import { Zip64CentralDirectoryLocatorRecord, EndOfCentralDirectoryRecord, Zip64EndOfCentralDirectoryRecord, CentralDirectoryRecord } from './types';

interface ZipFileReadOptions extends ReadableOptions {
  filter?: string | RegExp | Function;
}

export default class ZipFileReadStream extends Readable {
  private filter: string | RegExp | Function = null;
  private filesPushed = 0;
  private fileSize = 0;
  private fileDescriptor: number;
  constructor(private filePath: string, private options: ZipFileReadOptions) {
    super(options || { objectMode: true });
    this.filter = options.filter || null;
    this.checkPreConditions();
  }

  checkPreConditions() {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`${this.filePath} does not exist.`);
    }
    let fileStats = fs.statSync(this.filePath);
    if (!fileStats || !fileStats.size) {
      throw new Error(`Unable to get file stats of ${this.filePath}.`);
    }
    this.fileSize = fileStats.size;
    this.fileDescriptor = fs.openSync(this.filePath, 'r');
    let magicNumberBuffer = Buffer.alloc(4);
    fs.readSync(this.fileDescriptor, magicNumberBuffer, 0, 4, 0);
    if (magicNumberBuffer.readUInt32LE(0) !== ZIP_MAGIC_NUMBER) {
      fs.closeSync(this.fileDescriptor);
      throw new Error(`${this.filePath} is not a valid zip file or empty.`);
    }
  }

  readMetaInformation() {
    let eocdMagicNumberBuffer = Buffer.alloc(4, 0);
    let startPosition = this.fileSize - 20;
    while (startPosition > 0 && eocdMagicNumberBuffer.readUInt32LE(0) !== EndOfCentralDirectoryRecord.MAGIC_NUMBER()) {
      fs.readSync(this.fileDescriptor, eocdMagicNumberBuffer, 0, 4, startPosition--);
    }
    startPosition++;
    if (eocdMagicNumberBuffer.readUInt32LE(0) !== EndOfCentralDirectoryRecord.MAGIC_NUMBER()) {
      fs.closeSync(this.fileDescriptor);
      throw new Error(`Could not find EOCD record.`);
    }
    let zip64LocatorBuffer = Buffer.alloc(20);
    fs.readSync(this.fileDescriptor, zip64LocatorBuffer, 0, zip64LocatorBuffer.length, startPosition - 20);
    let zip64LocatorRecord = Zip64CentralDirectoryLocatorRecord.fromBuffer(zip64LocatorBuffer);
    if (zip64LocatorRecord.magicNumber === Zip64CentralDirectoryLocatorRecord.MAGIC_NUMBER()) {
      let zip64EocdBuffer = Buffer.alloc(56);
      fs.readSync(this.fileDescriptor, zip64EocdBuffer, 0, zip64EocdBuffer.length, zip64LocatorRecord.cdOffset);
      const zip64EoCdRecord = Zip64EndOfCentralDirectoryRecord.fromBuffer(zip64EocdBuffer);
      if (zip64EoCdRecord.magicNumber !== Zip64EndOfCentralDirectoryRecord.MAGIC_NUMBER()) {
        fs.closeSync(this.fileDescriptor);
        throw new Error('Could not find ZIP64 EOCD record');
      }
      this._eocdRecord = zip64EoCdRecord;
      this._cdBuffer = Buffer.alloc(zip64EoCdRecord.cdSize);
      fs.readSync(this._fd, this._cdBuffer, 0, this._cdBuffer.length, zip64EoCdRecord.cdOffset);
      this.splitCdBuffer();
      return;
    }
    let eocdBuffer = Buffer.alloc(this._fileSize - startPosition);
    fs.readSync(this._fd, eocdBuffer, 0, eocdBuffer.length, startPosition);
    this._eocdRecord = EocdRecord.fromBuffer(eocdBuffer);
    this._cdBuffer = Buffer.alloc(this._eocdRecord.cdSize);
    fs.readSync(this._fd, this._cdBuffer, 0, this._cdBuffer.length, this._eocdRecord.cdOffset);
    this.splitCdBuffer();
  }

  splitCdBuffer(eocdRecord: Zip64EndOfCentralDirectoryRecord | EndOfCentralDirectoryRecord) {
    let offset = 0;
    let currentCdRecord;
    for (let i = 0; i < eocdRecord.cdTotalCount; i++) {
      currentCdRecord = CentralDirectoryRecord.fromBuffer(this._cdBuffer.slice(offset));
      offset += currentCdRecord.recordSize;
      this._cdRecords.push(currentCdRecord);
    }
  }
}
