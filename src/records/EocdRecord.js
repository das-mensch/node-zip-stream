module.exports = class EocdRecord {
    constructor(magicNumber, diskNo, cdStartDisk, cdNoOnDisk, cdCount, cdSize, cdOffset, commentLength, comment) {
        this._magicNumber = magicNumber;
        this._diskNo = diskNo;
        this._cdStartDisk = cdStartDisk;
        this._cdNoOnDisk = cdNoOnDisk;
        this._cdCount = cdCount;
        this._cdSize = cdSize;
        this._cdOffset = cdOffset;
        this._commentLength = commentLength;
        this._comment = comment;
    }

    static MAGIC_NUMBER() {
        return 0x06054b50;
    }

    static fromBuffer(buffer) {
        if (!(buffer instanceof Buffer)) {
            throw new Error('Could not read EOCD record.');
        }
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
        let comment = "";
        if (commentLength > 0) {
            comment = buffer.slice(22).toString();
        }
        return new EocdRecord(magicNumber, diskNo, cdStartDisk, cdNoOnDisk, cdCount, cdSize, cdOffset, commentLength, comment);

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
};
