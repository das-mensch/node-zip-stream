enum RecordOffset {
  MAGIC_NUMBER = 0,
  DISK_NUMBER = 4,
  CENTRAL_DIRECTORY_START_DISK = 6,
  CENTRAL_DIRECTORY_NUMBER_OF_DISK = 8,
  CENTRAL_DIRECTORY_COUNT = 10,
  CENTRAL_DIRECTORY_SIZE = 12,
  CENTRAL_DIRECTORY_OFFSET = 16,
  COMMENT_LENGTH = 20,
  START_OF_RECORD_PAYLOAD = 22,
}

export class EndOfCentralDirectoryRecord {
  constructor(
    public magicNumber: number,
    public diskNumber: number,
    public cdStartDisk: number,
    public cdNumberOnDisk: number,
    public cdTotalCount: number,
    public cdSize: number,
    public cdOffset: number,
    public comment: string,
  ) {}

  static MAGIC_NUMBER(): number {
    return 0x06054b50;
  }

  static fromBuffer(buffer: Buffer): EndOfCentralDirectoryRecord {
    const commentLength = buffer.readUInt16LE(RecordOffset.COMMENT_LENGTH) || 0;
    const commentSliceStart = RecordOffset.START_OF_RECORD_PAYLOAD;
    const comment = buffer
      .slice(commentSliceStart, commentSliceStart + commentLength)
      .toString();

    return new EndOfCentralDirectoryRecord(
      buffer.readUInt32LE(RecordOffset.MAGIC_NUMBER),
      buffer.readUInt16LE(RecordOffset.DISK_NUMBER),
      buffer.readUInt16LE(RecordOffset.CENTRAL_DIRECTORY_START_DISK),
      buffer.readUInt16LE(RecordOffset.CENTRAL_DIRECTORY_NUMBER_OF_DISK),
      buffer.readUInt16LE(RecordOffset.CENTRAL_DIRECTORY_COUNT),
      buffer.readUInt32LE(RecordOffset.CENTRAL_DIRECTORY_SIZE),
      buffer.readUInt32LE(RecordOffset.CENTRAL_DIRECTORY_OFFSET),
      comment,
    );
  }
}
