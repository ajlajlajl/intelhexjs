import {promises as fs} from "fs"

export class memorySection {
    startAddress: number
    data: Buffer

    constructor(address: number) {
        this.startAddress = address
        this.data = Buffer.from([])
    }
}

export class memory {
    sections: memorySection[]
    startLinearAddress ?: number

    constructor() {
        this.sections = []
        this.startLinearAddress = undefined
    }
}

export enum intelHexRecordType {
    data = 0,
    endOfFile = 1,
    extendedSegmentAddress = 2,
    startSegmentAddress = 3,
    extendedLinearAddress = 4,
    startLinearAddress = 5,
}

export class intelHexLine {
    address: number = 0
    recordType: intelHexRecordType = 0
    data: number[] = []

    constructor(line?: string) {
        if (line !== undefined)
            this.parseLineString(line)
    }

    private parseLineString(line: string) {
        /*
        0-len
        1,2-address
        3-code
        */
        if (line[0] !== ':')
            throw new Error("Invalid Line Format. Expected ':' at beginning!")
        let byteCh = line.slice(1).match(/.{1,2}/g)
        if (byteCh === null || byteCh.length === 0)
            throw new Error("Invalid Line Format.")
        let bytes = byteCh.map(i => Number.parseInt(i, 16))
        if (bytes[0] != bytes.length - 5)
            throw new Error("Invalid Line Length.")
        this.address = bytes[1] * 256 + bytes[2]
        this.recordType = bytes[3]
        this.data = bytes.slice(4, bytes.length - 1)
        if (this.calcCrc() != bytes[bytes.length - 1])
            throw new Error(`Invalid Line CRC. Expected 0x${this.calcCrc().toString(16).padStart(2, '0')} got 0x${bytes[bytes.length - 1].toString(16).padStart(2, '0')}`)
    }

    private calcCrc(): number {
        let data: number[] = [this.data.length, (this.address >> 8) & 0xFF, this.address & 0xFF, this.recordType, ...this.data]
        let sum = data.reduce((sum, val) => sum + val, 0)
        return (~(sum & 0xFF) & 0xFF + 1) & 0xFF
    }

    generateLineString(): string {
        let bytes: number[] = [this.data.length, (this.address >> 8) & 0xFF, this.address & 0xFF, this.recordType, ...this.data, this.calcCrc()]
        return bytes.map(i => i.toString(16).padStart(2, '0')).join()
    }

    //Static
    static parse(line: string): intelHexLine {
        return new intelHexLine(line)
    }

    static generateLineString(address: number, recordType: intelHexRecordType, data: number[]) {
        let line = new intelHexLine()
        line.address = address
        line.recordType = recordType
        line.data = data
        return line.generateLineString()
    }
}

export function loadIntelHex(fileAddress: string) {

}
