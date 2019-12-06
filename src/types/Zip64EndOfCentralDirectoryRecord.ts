enum RecordOffset {
  MAGIC_NUMBER = 0,
  END_OF_CENTRAL_DIRECTORY_SIZE = 4,
  VERSION_MADE_BY = 12,
  VERSION_NEEDED = 14,
  NUMBER_OF_DISKS = 16,
  NUMBER_OF_DISK_START = 20,
  TOTAL_NUMBER_OF_DISKS = 24,
  TOTAL_COUNT = 32,
  CENTRAL_DIRECTORY_SIZE = 40,
  CENTRAL_DIRECTORY_OFFSET = 48,
}

export class Zip64EndOfCentralDirectoryRecord {
  constructor(
    public magicNumber: number,
    public endOfCentralDirectorySIze: number,
    public versionMadeBy: number,
    public versionNeeded: number,
    public cdNumberOfDisks: number,
    public cdNumberOfDiskStart: number,
    public cdTotalNumberOfDisks: number,
    public cdTotalCount: number,
    public cdSize: number,
    public cdOffset: number,
  ) {}

  static MAGIC_NUMBER() {
    return 0x06064b50;
  }

  static fromBuffer(buffer: Buffer): Zip64EndOfCentralDirectoryRecord {
    return new Zip64EndOfCentralDirectoryRecord(
      buffer.readUInt32LE(RecordOffset.MAGIC_NUMBER),
      buffer.readUIntLE(RecordOffset.END_OF_CENTRAL_DIRECTORY_SIZE, 4),
      buffer.readUInt16LE(RecordOffset.VERSION_MADE_BY),
      buffer.readUInt16LE(RecordOffset.VERSION_NEEDED),
      buffer.readUInt32LE(RecordOffset.NUMBER_OF_DISKS),
      buffer.readUInt32LE(RecordOffset.NUMBER_OF_DISK_START),
      buffer.readUIntLE(RecordOffset.TOTAL_NUMBER_OF_DISKS, 4),
      buffer.readUIntLE(RecordOffset.TOTAL_COUNT, 4),
      buffer.readUIntLE(RecordOffset.CENTRAL_DIRECTORY_SIZE, 4),
      buffer.readUIntLE(RecordOffset.CENTRAL_DIRECTORY_OFFSET, 4),
    );
  }
}
