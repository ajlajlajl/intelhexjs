import {Memory, MemorySection, loadIntelHexFile} from "../main"
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
