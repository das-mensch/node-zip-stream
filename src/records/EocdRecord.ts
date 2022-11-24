export class EocdRecord {
  constructor(
    private _magicNumber: number,
    private _diskNo: number,
    private _cdStartDisk: number,
    private _cdNoOnDisk: number,
    private _cdCount: number,
    private _cdSize: number,
    private _cdOffset: number,
    private _commentLength: number,
    private _comment: string
  ) {}

  static MAGIC_NUMBER() {
    return 0x06054b50;
  }

  static fromBuffer(buffer: Buffer) {
    const magicNumber = buffer.readUInt32LE(0);
    const diskNo = buffer.readUInt16LE(4);
    const cdStartDisk = buffer.readUInt16LE(6);
    const cdNoOnDisk = buffer.readUInt16LE(8);
    const cdCount = buffer.readUInt16LE(10);
    if (cdNoOnDisk !== cdCount) {
      throw new Error('Multipart archives are not supported yet.');
    }
    const cdSize = buffer.readUInt32LE(12);
    const cdOffset = buffer.readUInt32LE(16);
    const commentLength = buffer.readUInt16LE(20);
    let comment = '';
    if (commentLength > 0) {
      comment = buffer.subarray(22).toString();
    }
    return new EocdRecord(
      magicNumber,
      diskNo,
      cdStartDisk,
      cdNoOnDisk,
      cdCount,
      cdSize,
      cdOffset,
      commentLength,
      comment
    );
  }

  get magicNumber() {
    return this._magicNumber;
  }

  get cdSize() {
    return this._cdSize;
  }

  get cdOffset() {
    return this._cdOffset;
  }

  get cdCount() {
    return this._cdCount;
  }

  toString() {
    return `EOCD record:\n\tcdTotalNo: ${this._cdCount}\n\tComment: ${this._comment}\n`;
  }
}
