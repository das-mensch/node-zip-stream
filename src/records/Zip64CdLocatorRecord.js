module.exports = class Zip64CdLocatorRecord {
  constructor(magicNumber, cdStartDisk, cdOffset, noDisks) {
    this._magicNumber = magicNumber;
    this._cdStartDisk = cdStartDisk;
    this._cdOffset = cdOffset;
    this._noDisks = noDisks;
  }

  static MAGIC_NUMBER() {
    return 0x07064b50;
  }

  static fromBuffer(buffer) {
    if (!(buffer instanceof Buffer)) {
      throw new Error('Could not read Zip64 central directory record.');
    }
    const magicNumber = buffer.readUInt32LE(0);
    const cdStartDisk = buffer.readUInt32LE(4);
    const cdOffset = buffer.readUIntLE(8, 4);
    const noDisks = buffer.readUInt32LE(16);
    return new Zip64CdLocatorRecord(magicNumber, cdStartDisk, cdOffset, noDisks);
  }

  get magicNumber() {
    return this._magicNumber;
  }

  get cdStartDisk() {
    return this._cdStartDisk;
  }

  get cdOffset() {
    return this._cdOffset;
  }

  get noDisks() {
    return this._noDisks;
  }

  toString() {
    return `Zip64 central directory locator record:\n\tcdOffset@: ${this.cdOffset}\n`;
  }
};
