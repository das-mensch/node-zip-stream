enum RecordOffset {
  MAGIC_NUMBER = 0,
  VERSION_CREATE = 4,
  MIN_VERSION = 6,
  GENERAL_PURPOSE_FLAG = 8,
  COMPRESSION_METHOD = 10,
  MODIFICATION_TIME = 12,
  MODIFICATION_DATE = 14,
  CRC32 = 16,
  COMPRESSED_SIZE = 20,
  UNCOMPRESSED_SIZE = 24,
  FILE_NAME_LENGTH = 28,
  EXTRA_FIELD_LENGTH = 30,
  COMMENT_LENGTH = 32,
  D_START = 34,
  INTERNAL_FILE_ATTRIBUTE = 36,
  EXTERNAL_FILE_ATTRIBUTE = 38,
  OFFSET = 42,
  START_OF_RECORD_PAYLOAD = 46,
}

export class CentralDirectoryRecord {
  public recordLength: number;
  constructor(
    public magicNumber: number,
    public versionCreate: number,
    public minVersion: number,
    public generalPurposeFlag: number,
    public compressionMethod: number,
    public modTime: number,
    public modDate: number,
    public crc32: number,
    public compressedSize: number,
    public uncompressedSize: number,
    public dStart: number,
    public internalFileAttr: number,
    public externalFileAttr: number,
    public offset: number,
    public fileName: string,
    public extraField: string,
    public comment: string,
  ) {
    this.recordLength =
      this.fileName.length +
      this.comment.length +
      this.extraField.length +
      RecordOffset.START_OF_RECORD_PAYLOAD;
  }

  static fromBuffer(buffer: Buffer): CentralDirectoryRecord {
    const fileNameLength = buffer.readUInt16LE(RecordOffset.FILE_NAME_LENGTH);
    const extraFieldLength = buffer.readUInt16LE(
      RecordOffset.EXTRA_FIELD_LENGTH,
    );
    const commentLength = buffer.readUInt16LE(RecordOffset.COMMENT_LENGTH);
    const fileName =
      fileNameLength > 0
        ? buffer
            .slice(
              RecordOffset.START_OF_RECORD_PAYLOAD,
              RecordOffset.START_OF_RECORD_PAYLOAD + fileNameLength,
            )
            .toString()
        : '';
    const extraField =
      extraFieldLength > 0
        ? buffer
            .slice(
              RecordOffset.START_OF_RECORD_PAYLOAD + fileNameLength,
              RecordOffset.START_OF_RECORD_PAYLOAD +
                fileNameLength +
                extraFieldLength,
            )
            .toString()
        : '';
    const comment =
      commentLength > 0
        ? buffer
            .slice(
              RecordOffset.START_OF_RECORD_PAYLOAD +
                fileNameLength +
                extraFieldLength,
              RecordOffset.START_OF_RECORD_PAYLOAD +
                fileNameLength +
                extraFieldLength +
                commentLength,
            )
            .toString()
        : '';
    return new CentralDirectoryRecord(
      buffer.readUInt32LE(RecordOffset.MAGIC_NUMBER),
      buffer.readUInt16LE(RecordOffset.VERSION_CREATE),
      buffer.readUInt16LE(RecordOffset.MIN_VERSION),
      buffer.readUInt16LE(RecordOffset.GENERAL_PURPOSE_FLAG),
      buffer.readUInt16LE(RecordOffset.COMPRESSION_METHOD),
      buffer.readUInt16LE(RecordOffset.MODIFICATION_TIME),
      buffer.readUInt16LE(RecordOffset.MODIFICATION_DATE),
      buffer.readUInt32LE(RecordOffset.CRC32),
      buffer.readUInt32LE(RecordOffset.COMPRESSED_SIZE),
      buffer.readUInt32LE(RecordOffset.UNCOMPRESSED_SIZE),
      buffer.readUInt16LE(RecordOffset.D_START),
      buffer.readUInt16LE(RecordOffset.INTERNAL_FILE_ATTRIBUTE),
      buffer.readUInt32LE(RecordOffset.EXTERNAL_FILE_ATTRIBUTE),
      buffer.readUInt32LE(RecordOffset.OFFSET),
      fileName,
      extraField,
      comment,
    );
  }
}
