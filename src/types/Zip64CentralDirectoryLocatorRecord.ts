enum RecordOffset {
  MAGIC_NUMBER = 0,
  CENTRAL_DIRECTORY_START_DISK = 4,
  CENTRAL_DIRECTORY_OFFSET = 8,
  CENTRAL_DIRECTORY_NUMBER_OF_DISKS = 16,
}

export class Zip64CentralDirectoryLocatorRecord {
  constructor(
    public magicNumber: number,
    public cdStartDisk: number,
    public cdOffset: number,
    public cdNumberOfDisks: number,
  ) {}

  check(): Zip64CentralDirectoryLocatorRecord {
    return this;
  }

  static MAGIC_NUMBER() {
    return 0x07064b50;
  }

  static fromBuffer(buffer: Buffer): Zip64CentralDirectoryLocatorRecord {
    return new Zip64CentralDirectoryLocatorRecord(
      buffer.readUInt32LE(RecordOffset.MAGIC_NUMBER),
      buffer.readUInt32LE(RecordOffset.CENTRAL_DIRECTORY_START_DISK),
      buffer.readUIntLE(RecordOffset.CENTRAL_DIRECTORY_OFFSET, 4),
      buffer.readUInt32LE(RecordOffset.CENTRAL_DIRECTORY_NUMBER_OF_DISKS),
    ).check();
  }
}
