import {generateIntelHex, IntelHexGeneratorOptionsArch, loadIntelHexFile, Memory, MemorySection} from "../main"
import * as path from 'path'
import {promises as fs} from "fs"

describe("Hex File Parser", function () {
    it("M1", async function (done) {
        let mem = await loadIntelHexFile(path.join(__dirname, '../../resource/spec/m1.hex'))
        let data: Buffer = await fs.readFile(path.join(__dirname, '../../resource/spec/m1.bin'))
        expect(mem.startLinearAddress).toBeUndefined()
        expect(mem.startSegmentAddress).toBeUndefined()
        expect(mem.sections.length).toBe(1)
        expect(mem.sections[0].startAddress).toBe(0)
        expect(mem.sections[0].data).toEqual([...data])
        done()
    })
    it("M2", async function (done) {
        let mem = await loadIntelHexFile(path.join(__dirname, '../../resource/spec/m2.hex'))
        let data: Buffer = await fs.readFile(path.join(__dirname, '../../resource/spec/m2.bin'))
        expect(mem.startLinearAddress).toBeUndefined()
        expect(mem.startSegmentAddress).toBeUndefined()
        expect(mem.sections.length).toBe(1)
        expect(mem.sections[0].startAddress).toBe(0xB358)
        expect(mem.sections[0].data).toEqual([...data])
        done()
    })
    it("M3", async function (done) {
        let mem = await loadIntelHexFile(path.join(__dirname, '../../resource/spec/m3.hex'))
        let data1: Buffer = await fs.readFile(path.join(__dirname, '../../resource/spec/m3_1.bin'))
        let data2: Buffer = await fs.readFile(path.join(__dirname, '../../resource/spec/m3_2.bin'))
        expect(mem.startLinearAddress).toBeUndefined()
        expect(mem.startSegmentAddress).toBe(0x1000F000)
        expect(mem.sections.length).toBe(2)
        expect(mem.sections[0].startAddress).toBe(0xE26A)
        expect(mem.sections[0].data).toEqual([...data1])
        expect(mem.sections[1].startAddress).toBe(0x1F000)
        expect(mem.sections[1].data).toEqual([...data2])
        done()
    })
    it("M4", async function (done) {
        let mem = await loadIntelHexFile(path.join(__dirname, '../../resource/spec/m4.hex'))
        let data1: Buffer = await fs.readFile(path.join(__dirname, '../../resource/spec/m4_1.bin'))
        let data2: Buffer = await fs.readFile(path.join(__dirname, '../../resource/spec/m4_2.bin'))
        expect(mem.startLinearAddress).toBe(0x08008879)
        expect(mem.startSegmentAddress).toBeUndefined()
        expect(mem.sections.length).toBe(2)
        expect(mem.sections[0].startAddress).toBe(0x08000000)
        expect(mem.sections[0].data).toEqual([...data1])
        expect(mem.sections[1].startAddress).toBe(0x08060000)
        expect(mem.sections[1].data).toEqual([...data2])
        done()
    })
})
describe("Hex File Generator", function () {
    it("M1", async function (done) {
        let hex = await fs.readFile(path.join(__dirname, '../../resource/spec/m1.hex'), 'utf8')
        let data: Buffer = await fs.readFile(path.join(__dirname, '../../resource/spec/m1.bin'))
        let mem = new Memory()
        mem.sections.push(new MemorySection(0, [...data]))
        let text = generateIntelHex(mem, {
            architecture: IntelHexGeneratorOptionsArch.b16,
            bytesInOneLine: 16,
            skipEOF: true,
        })
        expect(text).toEqual(hex.trim())
        done()
    })
    it("M2", async function (done) {
        let hex = await fs.readFile(path.join(__dirname, '../../resource/spec/m2.hex'), 'utf8')
        let data: Buffer = await fs.readFile(path.join(__dirname, '../../resource/spec/m2.bin'))
        let mem = new Memory()
        mem.sections.push(new MemorySection(0xB358, [...data]))
        let text = generateIntelHex(mem, {
            architecture: IntelHexGeneratorOptionsArch.b16,
            bytesInOneLine: 16,
            skipEOF: true,
        })
        expect(text).toEqual(hex.trim())
        done()
    })
    it("M3", async function (done) {
        let hex = await fs.readFile(path.join(__dirname, '../../resource/spec/m3.hex'), 'utf8')
        let data1: Buffer = await fs.readFile(path.join(__dirname, '../../resource/spec/m3_1.bin'))
        let data2: Buffer = await fs.readFile(path.join(__dirname, '../../resource/spec/m3_2.bin'))
        let mem = new Memory()
        mem.sections.push(new MemorySection(0xE26A, [...data1]))
        mem.sections.push(new MemorySection(0x1F000, [...data2]))
        mem.startSegmentAddress = 0x1000F000
        let text = generateIntelHex(mem, {
            architecture: IntelHexGeneratorOptionsArch.b16,
            bytesInOneLine: 16,
        })
        expect(text).toEqual(hex.trim())
        done()
    })
    it("M4", async function (done) {
        let hex = await fs.readFile(path.join(__dirname, '../../resource/spec/m4.hex'), 'utf8')
        let data1: Buffer = await fs.readFile(path.join(__dirname, '../../resource/spec/m4_1.bin'))
        let data2: Buffer = await fs.readFile(path.join(__dirname, '../../resource/spec/m4_2.bin'))
        let mem = new Memory()
        mem.sections.push(new MemorySection(0x08000000, [...data1]))
        mem.sections.push(new MemorySection(0x08060000, [...data2]))
        mem.startLinearAddress=0x08008879
        let text = generateIntelHex(mem, {
            architecture: IntelHexGeneratorOptionsArch.b32,
            bytesInOneLine: 32,
        })
        expect(text).toEqual(hex.trim())
        done()
    })
})
