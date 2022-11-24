export class CdRecord {
  private _recordSize: number;

  constructor(
    private _magicNumber: number,
    private _versionCreate: number,
    private _minVersion: number,
    private _gpFlag: number,
    private _cMethod: number,
    private _modTime: number,
    private _modDate: number,
    private _crc32: number,
    private _cSize: number,
    private _ucSize: number,
    private _dStart: number,
    private _internalFileAttr: number,
    private _externalFileAttr: number,
    private _offset: number,
    private _fileName: string,
    private _extraField: string,
    private _comment: string
  ) {
    this._recordSize = 46 + this._fileName.length + this._extraField.length + this._comment.length;
  }

  static fromBuffer(buffer: Buffer) {
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
    let fileName = '';
    if (fileNameLength > 0) {
      fileName = buffer.subarray(
        46,
        46 + fileNameLength
      ).toString();
    }
    let extraField = '';
    if (extraFieldLength > 0) {
      extraField = buffer.subarray(
        46 + fileNameLength,
        46 + fileNameLength + extraFieldLength
      ).toString();
    }
    let comment = '';
    if (commentLength > 0) {
      comment = buffer.subarray(
        46 + fileNameLength + extraFieldLength,
        46 + fileNameLength + extraFieldLength + commentLength
      ).toString();
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
      return 'OTHER';
    }
  }

  toString() {
    return `CD record for file '${this._fileName}':
      Compression method: ${this.cMethodName}
      Compressed size: ${this._cSize}
      Uncompressed size: ${this._ucSize}
    `;
  }
}
