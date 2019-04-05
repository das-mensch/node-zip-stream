module.exports = class LocalFileHeader {
  constructor(
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
  ) {
    this._magicNumber = magicNumber;
    this._versionNeeded = versionNeeded;
    this._generalPurposeFlags = generalPurposeFlags;
    this._compressionMethod = compressionMethod;
    this._lastModTime = lastModTime;
    this._lastModDate = lastModDate;
    this._crc32 = crc32;
    this._compressedSize = compressedSize;
    this._uncompressedSize = uncompressedSize;
    this._fileNameLength = fileNameLength;
    this._extraFieldLength = extraFieldLength;
  }

  static MAGIC_NUMBER() {
    return 0x04034b50;
  }

  static fromBuffer(buffer) {
    if (!(buffer instanceof Buffer)) {
      throw new Error('Could not read Zip64 central directory record.');
    }
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
};