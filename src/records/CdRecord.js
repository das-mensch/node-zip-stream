module.exports = class CdRecord {
  constructor(
    magicNumber,
    versionCreate,
    minVersion,
    gpFlag,
    cMethod,
    modTime,
    modDate,
    crc32,
    cSize,
    ucSize,
    dStart,
    internalFileAttr,
    externalFileAttr,
    offset,
    fileName,
    extraField,
    comment
  ) {
    this._magicNumber = magicNumber;
    this._versionCreate = versionCreate;
    this._minVersion = minVersion;
    this._gpFlag = gpFlag;
    this._cMethod = cMethod;
    this._modTime = modTime;
    this._modDate = modDate;
    this._crc32 = crc32;
    this._cSize = cSize;
    this._ucSize = ucSize;
    this._dStart = dStart;
    this._internalFileAttr = internalFileAttr;
    this._externalFileAttr = externalFileAttr;
    this._offset = offset;
    this._fileName = fileName;
    this._extraField = extraField;
    this._comment = comment;
    this._recordSize = 46 + this._fileName.length + this._extraField.length + this._comment.length;
  }

  static fromBuffer(buffer) {
    if (!(buffer instanceof Buffer)) {
      throw new Error('Could not read CD record');
    }
    const magicNumber = buffer.readUInt32LE(0);
    const versionCreate = buffer.readUInt16LE(4);
    const minVersion = buffer.readUInt16LE(6);
    const gpFlag = buffer.readUInt16LE(8);
    const cMethod = buffer.readUInt16LE(10);
    const modTime = buffer.readUInt16LE(12);
    const modDate = buffer.readUInt16LE(14);
    const crc32 = buffer.readUInt32LE(16);
    const cSize = buffer.readUInt32LE(20);
    const ucSize = buffer.readUInt32LE(24);
    const fileNameLength = buffer.readUInt16LE(28);
    const extraFieldLength = buffer.readUInt16LE(30);
    const commentLength = buffer.readUInt16LE(32);
    const dStart = buffer.readUInt16LE(34);
    const internalFileAttr = buffer.readUInt16LE(36);
    const externalFileAttr = buffer.readUInt32LE(38);
    const offset = buffer.readUInt32LE(42);
    let fileName = "";
    if (fileNameLength > 0) {
      fileName = buffer.slice(46, 46 + fileNameLength).toString();
    }
    let extraField = "";
    if (extraFieldLength > 0) {
      extraField = buffer.slice(46 + fileNameLength, 46 + fileNameLength + extraFieldLength).toString();
    }
    let comment = "";
    if (commentLength > 0) {
      comment = buffer.slice(46 + fileNameLength + extraFieldLength, 46 + fileNameLength + extraFieldLength + commentLength).toString();
    }
    return new CdRecord(
      magicNumber,
      versionCreate,
      minVersion,
      gpFlag,
      cMethod,
      modTime,
      modDate,
      crc32,
      cSize,
      ucSize,
      dStart,
      internalFileAttr,
      externalFileAttr,
      offset,
      fileName,
      extraField,
      comment
    );
  }

  get magicNumber() {
    return this._magicNumber;
  }

  get offset() {
    return this._offset;
  }

  get fileName() {
    return this._fileName;
  }

  get extraField() {
    return this._extraField;
  }

  get compressedSize() {
    return this._cSize;
  }

  get recordSize() {
    return this._recordSize;
  }

  get cMethodName() {
    switch (this._cMethod) {
      case 0:
        return 'STORE';
      case 8:
        return 'DEFLATE';
      default:
        return 'OTHER'
    }
  }

  toString() {
    return `CD record for file '${this._fileName}':\n\tCompression method: ${this.cMethodName}\n\tCompressed size: ${this._cSize}\n\tUncompressed size: ${this._ucSize}\n`;
  }
};
