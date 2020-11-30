import {promises as fs} from "fs"

export class memorySection {
    startAddress: number
    data: Buffer

export class MemorySection {
    startAddress: number = 0
    data: number[] = []

    constructor(address: number, data: number[] = []) {
        this.startAddress = address
        this.data = data
    }
}

export class Memory {
    sections: MemorySection[] = []
    startLinearAddress?: number = undefined
    startSegmentAddress?: number = undefined

    merge() {
        let merged: MemorySection[] = [...this.sections.splice(0, 1)]
        while (this.sections.length > 0) {
            let ms = this.sections.splice(0, 1)[0]
            let mStart = ms.startAddress
            let mEnd = ms.startAddress + ms.data.length
            let foundMS: MemorySection | undefined
            if ((foundMS = merged.find(i => i.startAddress === mEnd)) !== undefined) {
                foundMS.startAddress = mStart
                foundMS.data = [...ms.data, ...foundMS.data]
            } else if ((foundMS = merged.find(i => (i.startAddress + i.data.length) === mStart)) !== undefined) {
                foundMS.data = [...foundMS.data, ...ms.data]
            } else {
                merged.push(ms)
            }
        }
        this.sections = merged
    }
}

export enum IntelHexRecordType {
    data = 0,
    endOfFile = 1,
    extendedSegmentAddress = 2,
    startSegmentAddress = 3,
    extendedLinearAddress = 4,
    startLinearAddress = 5,
}

export class IntelHexLine {
    address: number = 0
    recordType: IntelHexRecordType = 0
    data: number[] = []

    constructor(line?: string) {
        if (line !== undefined)
            this.parseLineString(line)
    }

    private parseLineString(line: string) {
        line = line.trim()
        /*
        0-len
        1,2-address
        3-code
        */
        if (line.length % 2 == 0)
            throw new Error("Invalid Line Format. odd number of characters!")
        if (line[0] !== ':')
            throw new Error("Invalid Line Format. Expected ':' at beginning!")
        let byteCh = line.slice(1).match(/.{1,2}/g)
        if (byteCh === null || byteCh.length === 0)
            throw new Error("Invalid Line Format.")
        let bytes = byteCh.map(i => Number.parseInt(i, 16))
        if (bytes[0] != bytes.length - 5)
            throw new Error("Invalid Line Length.")
        this.address = (bytes[1] << 8) + bytes[2]
        this.recordType = bytes[3]
        this.data = bytes.slice(4, bytes.length - 1)
        if (this.calcCrc() != bytes[bytes.length - 1])
            throw new Error(`Invalid Line CRC. Expected 0x${this.calcCrc().toString(16).padStart(2, '0')} got 0x${bytes[bytes.length - 1].toString(16).padStart(2, '0')}`)
    }

    private calcCrc(): number {
        let data: number[] = [this.data.length, (this.address >> 8) & 0xFF, this.address & 0xFF, this.recordType, ...this.data]
        let sum = data.reduce((sum, val) => sum + val, 0)
        return ((~(sum & 0xFF) & 0xFF) + 1) & 0xFF
    }

    generateLineString(upperCase: boolean = true): string {
        let bytes: number[] = [this.data.length, (this.address >> 8) & 0xFF, this.address & 0xFF, this.recordType, ...this.data, this.calcCrc()]
        let str = bytes.map(i => i.toString(16).padStart(2, '0')).join('')
        if (upperCase)
            str = str.toUpperCase()
        return ':' + str
    }

    //Static
    static parse(line: string): IntelHexLine {
        return new IntelHexLine(line)
    }

    static generateLineString(address: number, recordType: IntelHexRecordType, data: number[]): string {
        let line = new IntelHexLine()
        line.address = address
        line.recordType = recordType
        line.data = data
        return line.generateLineString()
    }
}

export async function loadIntelHexFile(fileAddress: string): Promise<Memory> {
    let data = await fs.readFile(fileAddress, 'utf8')
    return loadIntelHex(data)
}

export function loadIntelHex(data: string): Memory {
    let lines = data.split('\n').map(l => l.trim())
    let baseAddress = 0
    let memory = new Memory()
    let eof: boolean = false
    lines.forEach((lineStr, li) => {
        try {
            if (eof)
                return
            if (lineStr.trim().length === 0)
                return
            let line = new IntelHexLine(lineStr)
            switch (line.recordType) {
                case IntelHexRecordType.data:
                    memory.sections.push(new MemorySection(baseAddress + line.address, line.data))
                    break
                case IntelHexRecordType.endOfFile:
                    eof = true
                    break
                case IntelHexRecordType.extendedLinearAddress:
                    if (line.data.length != 2)
                        throw new Error("Invalid data size for this record")
                    baseAddress = ((line.data[0] << 8) + line.data[1]) << 16
                    break
                case IntelHexRecordType.extendedSegmentAddress:
                    if (line.data.length != 2)
                        throw new Error("Invalid data size for this record")
                    baseAddress = ((line.data[0] << 8) + line.data[1]) << 4
                    break
                case IntelHexRecordType.startLinearAddress:
                    if (line.data.length != 4)
                        throw new Error("Invalid data size for this record")
                    memory.startLinearAddress =
                        (line.data[0] << 24) +
                        (line.data[1] << 16) +
                        (line.data[2] << 8) +
                        line.data[3]
                    break
                case IntelHexRecordType.startSegmentAddress:
                    if (line.data.length != 4)
                        throw new Error("Invalid data size for this record")
                    memory.startSegmentAddress =
                        (line.data[0] << 24) +
                        (line.data[1] << 16) +
                        (line.data[2] << 8) +
                        line.data[3]
                    break
            }
        } catch (err) {
            throw new Error(`Parsing failed at line #${li}: ${err.message}`)
        }
    })
    memory.merge()
    return memory
}

export enum IntelHexGeneratorOptionsArch {
    b16 = 'b16',
    b32 = 'b32',
}

export enum IntelHexGeneratorOptionsEOL {
    system = 'system',
    lf = 'lf',
    crlf = 'crlf',
    cr = 'cr',
}

export interface IntelHexGeneratorOptions {
    useUppecaseForHexadecimalCharacters?: boolean
    bytesInOneLine?: number
    architecture?: IntelHexGeneratorOptionsArch
    endOfLine?: IntelHexGeneratorOptionsEOL
}

let defaultIntelHexGeneratorOptions: IntelHexGeneratorOptions = {
    useUppecaseForHexadecimalCharacters: true,
    bytesInOneLine: 16,
    architecture: IntelHexGeneratorOptionsArch.b32,
    endOfLine: IntelHexGeneratorOptionsEOL.system,
}

export async function generateIntelHexFile(fileAddress: string, mem: Memory, opt?: IntelHexGeneratorOptions) {
    let data = generateIntelHex(mem, opt)
    await fs.writeFile(fileAddress, 'utf8')
}

export function generateIntelHex(mem: Memory, opt?: IntelHexGeneratorOptions) {
    let options: IntelHexGeneratorOptions = {}/*= {
        useUppecaseForHexadecimalCharacters: defaultIntelHexGeneratorOptions.useUppecaseForHexadecimalCharacters,
        bytesInOneLine: defaultIntelHexGeneratorOptions.bytesInOneLine,
        architecture: defaultIntelHexGeneratorOptions.architecture,
        endOfLine: defaultIntelHexGeneratorOptions.endOfLine,
    }*/
    if (opt !== undefined) {
        for (let i in defaultIntelHexGeneratorOptions) {
            // @ts-ignore
            options[i] = opt[i] === undefined ? defaultIntelHexGeneratorOptions[i] : opt[i]
        }
    } else
        options = defaultIntelHexGeneratorOptions
    let lines: string[] = []
    if (mem.sections.length > 0) {
        let maxAddress = mem.sections.reduce((sum, i) => Math.max(sum, i.startAddress + i.data.length), 0)
        if (maxAddress > AddressLimit[options.architecture as IntelHexGeneratorOptionsArch])
            throw new Error('Address exceeding architecture limit')
        let currentAddress = 0
        let shifttedAddress = 0
        let bpl = options.bytesInOneLine as number
        mem.sections.forEach(memSec => {
            if (memSec.data.length === 0)
                return
            for (let i = 0; i < memSec.data.length; i += bpl) {
                let dataBytes = memSec.data.slice(i * bpl, bpl)
            }
        })
    }
    if (mem.startSegmentAddress !== undefined) {
        lines.push(IntelHexLine.generateLineString(0, 3, [
            (mem.startSegmentAddress >> 24) & 0xFF,
            (mem.startSegmentAddress >> 16) & 0xFF,
            (mem.startSegmentAddress >> 8) & 0xFF,
            (mem.startSegmentAddress) & 0xFF,
        ]))
    }
    if (mem.startLinearAddress !== undefined) {
        lines.push(IntelHexLine.generateLineString(0, 5, [
            (mem.startLinearAddress >> 24) & 0xFF,
            (mem.startLinearAddress >> 16) & 0xFF,
            (mem.startLinearAddress >> 8) & 0xFF,
            (mem.startLinearAddress) & 0xFF,
        ]))
    }
    lines.push(IntelHexLine.generateLineString(0, 1, []))
    return lines.join(EOLChar[options.endOfLine as IntelHexGeneratorOptionsEOL])
}
