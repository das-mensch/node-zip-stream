export class Zip64EocdRecord {
  constructor(
    private _magicNumber: number,
    private _eocdSize: number,
    private _versionMadeBy: number,
    private _versionNeeded: number,
    private _noOfDisk: number,
    private _noOfDiskStart: number,
    private _cdTotalNoOnDisk: number,
    private _cdTotalNo: number,
    private _cdSize: number,
    private _cdOffset: number
  ) {}

  static MAGIC_NUMBER() {
    return 0x06064b50;
  }

  static fromBuffer(buffer: Buffer) {
    const magicNumber = buffer.readUInt32LE(0);
    const eocdSize = buffer.readUIntLE(4, 4);
    const versionMadeBy = buffer.readUInt16LE(12);
    const versionNeeded = buffer.readUInt16LE(14);
    const noOfDisk = buffer.readUInt32LE(16);
    const noOfDiskStart = buffer.readUInt32LE(20);
    const cdTotalNoOnDisk = buffer.readUIntLE(24, 4);
    const cdTotalNo = buffer.readUIntLE(32, 4);
    const cdSize = buffer.readUIntLE(40, 4);
    const cdOffset = buffer.readUIntLE(48, 4);

    return new Zip64EocdRecord(
      magicNumber,
      eocdSize,
      versionMadeBy,
      versionNeeded,
      noOfDisk,
      noOfDiskStart,
      cdTotalNoOnDisk,
      cdTotalNo,
      cdSize,
      cdOffset
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
    return this._cdTotalNo;
  }

  toString() {
    return `ZIP64EOCD record:
      cdTotalNo: ${this._cdTotalNo}
      VersionMade: ${this._versionMadeBy}
      VersionNeeded: ${this._versionNeeded}
    `;
  }
}
