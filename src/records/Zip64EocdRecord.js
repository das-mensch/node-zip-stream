module.exports = class Zip64EocdRecord {
    constructor(magicNumber, eocdSize, versionMadeBy, versionNeeded, noOfDisk, noOfDiskStart, cdTotalNoOnDisk, cdTotalNo, cdSize, cdOffset) {
        this._magicNumber = magicNumber;
        this._eocdSize = eocdSize;
        this._versionMadeBy = versionMadeBy;
        this._versionNeeded = versionNeeded;
        this._noOfDisk = noOfDisk;
        this._noOfDiskStart = noOfDiskStart;
        this._cdTotalNoOnDisk = cdTotalNoOnDisk;
        this._cdTotalNo = cdTotalNo;
        this._cdSize = cdSize;
        this._cdOffset = cdOffset;
    }

    static MAGIC_NUMBER() {
        return 0x06064b50;
    }

    static fromBuffer(buffer) {
        if (!(buffer instanceof Buffer)) {
            throw new Error('Could not read ZIP64EOCD record.');
        }
        const magicNumber = buffer.readUInt32LE(0);
        const eocdSize = buffer.readUIntLE(4, 8, false);
        const versionMadeBy = buffer.readUInt16LE(12);
        const versionNeeded = buffer.readUInt16LE(14);
        const noOfDisk = buffer.readUInt32LE(16);
        const noOfDiskStart = buffer.readUInt32LE(20);
        const cdTotalNoOnDisk = buffer.readUIntLE(24, 8, false);
        const cdTotalNo = buffer.readUIntLE(32, 8, false);
        const cdSize = buffer.readUIntLE(40, 8, false);
        const cdOffset = buffer.readUIntLE(48, 8, false);

        return new Zip64EocdRecord(magicNumber, eocdSize, versionMadeBy, versionNeeded, noOfDisk, noOfDiskStart, cdTotalNoOnDisk, cdTotalNo, cdSize, cdOffset);

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
        return `ZIP64EOCD record:\n\tcdTotalNo: ${this._cdTotalNo}\n\tVersionMade: ${this._versionMadeBy}\n\tVersionNeeded: ${this._versionNeeded}\n`;
    }
};
