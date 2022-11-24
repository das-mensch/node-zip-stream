export class LocalFileHeader {
  constructor(
    private _magicNumber: number,
    private _versionNeeded: number,
    private _generalPurposeFlags: number,
    private _compressionMethod: number,
    private _lastModTime: number,
    private _lastModDate: number,
    private _crc32: number,
    private _compressedSize: number,
    private _uncompressedSize: number,
    private _fileNameLength: number,
    private _extraFieldLength: number
  ) {}

  static MAGIC_NUMBER() {
    return 0x04034b50;
  }

  static fromBuffer(buffer: Buffer) {
    const magicNumber = buffer.readUInt32LE(0);
    const versionNeeded = buffer.readUInt16LE(4);
    const generalPurposeFlags = buffer.readUInt16LE(6);
    const compressionMethod = buffer.readUInt16LE(8);
    const lastModTime = buffer.readUInt16LE(10);
    const lastModDate = buffer.readUInt16LE(12);
    const crc32 = buffer.readUInt32LE(14);
    const compressedSize = buffer.readUInt32LE(18);
    const uncompressedSize = buffer.readUInt32LE(22);
    const fileNameLength = buffer.readUInt16LE(26);
    const extraFieldLength = buffer.readUInt16LE(28);
    return new LocalFileHeader(
      magicNumber,
      versionNeeded,
      generalPurposeFlags,
      compressionMethod,
      lastModTime,
      lastModDate,
      crc32,
      compressedSize,
      uncompressedSize,
      fileNameLength,
      extraFieldLength
    );
  }

  get magicNumber() {
    return this._magicNumber;
  }

  get recordSize() {
    return 30 + this._fileNameLength + this._extraFieldLength;
  }

  toString() {
    return `Local File Header of size: ${this.recordSize}`;
  }
}