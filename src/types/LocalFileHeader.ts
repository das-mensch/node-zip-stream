import { Checkable } from './Checkable';

enum RecordOffset {
  MAGIC_NUMBER = 0,
  VERSION_NEEDED = 4,
  GENERAL_PURPOSE_FLAGS = 6,
  COMPRESSION_METHOD = 8,
  LAST_MODIFICATION_TIME = 10,
  LAST_MODIFICATION_DATE = 12,
  CRC32 = 14,
  COMPRESSED_SIZE = 18,
  UNCOMPRESSED_SIZE = 22,
  FILE_NAME_LENGTH = 26,
  EXTRA_FIELD_LENGTH = 28,
  START_OF_RECORD_PAYLOAD = 30,
}

export class LocalFileHeader {
  constructor(
    public magicNumber: number,
    public versionNeeded: number,
    public generalPurposeFlag: number,
    public compressionMethod: number,
    public lastModificationDate: number,
    public lastModificationTime: number,
    public crc32: number,
    public compressedSize: number,
    public uncompressedSize: number,
    public fileName: string,
    public extraField: string,
  ) {}

  check(): LocalFileHeader {
    return this;
  }

  static fromBuffer(buffer: Buffer): LocalFileHeader {
    const fileNameLength =
      buffer.readUInt16LE(RecordOffset.FILE_NAME_LENGTH) || 0;
    const extraFieldLength =
      buffer.readUInt16LE(RecordOffset.EXTRA_FIELD_LENGTH) || 0;
    let sliceStart = RecordOffset.START_OF_RECORD_PAYLOAD;
    const fileName = buffer
      .slice(sliceStart, sliceStart + fileNameLength)
      .toString();
    sliceStart += fileNameLength;
    const extraField = buffer
      .slice(sliceStart, sliceStart + extraFieldLength)
      .toString();

    return new LocalFileHeader(
      buffer.readUInt32LE(RecordOffset.MAGIC_NUMBER),
      buffer.readUInt16LE(RecordOffset.VERSION_NEEDED),
      buffer.readUInt16LE(RecordOffset.GENERAL_PURPOSE_FLAGS),
      buffer.readUInt16LE(RecordOffset.COMPRESSION_METHOD),
      buffer.readUInt16LE(RecordOffset.LAST_MODIFICATION_TIME),
      buffer.readUInt16LE(RecordOffset.LAST_MODIFICATION_DATE),
      buffer.readUInt32LE(RecordOffset.CRC32),
      buffer.readUInt32LE(RecordOffset.COMPRESSED_SIZE),
      buffer.readUInt32LE(RecordOffset.UNCOMPRESSED_SIZE),
      fileName,
      extraField,
    ).check();
  }
}
