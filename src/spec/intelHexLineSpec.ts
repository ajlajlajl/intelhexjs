import {IntelHexLine, IntelHexRecordType} from "../main"

describe("Line Parser", function () {
    it("Length", function () {
        try {
            let l
            l = new IntelHexLine(':0000000000')
            l = new IntelHexLine(' :0000000000')
            l = new IntelHexLine(':0000000000 ')
            l = new IntelHexLine(':020000000000FE')
        } catch (e) {
            fail(e)
        }
        expect(() => {
            let l = new IntelHexLine(':0100000000')
        }).toThrow()
        expect(() => {
            let l = new IntelHexLine(':00000000000')
        }).toThrow()
    })
    it("CRC", function () {
        expect(() => {
            let l = new IntelHexLine(':0000000001')
        }).toThrow()
        expect(() => {
            let l = new IntelHexLine(':10B51800B18B0108BD930008DF930008433A5C55DF')
        }).toThrow()
        try {
            let l
            l = new IntelHexLine(':00000100FF')
            l = new IntelHexLine(':10B51800B18B0008BD930008DF930008433A5C55DF')
        } catch (e) {
            fail(e)
        }
    })
    it("Sample", function () {
        let l = new IntelHexLine(':100130003F0156702B5E712B722B732146013421C7')
        expect(l.data.length).toBe(16)
        expect(l.recordType).toBe(0)
        expect(l.address).toBe(0x0130)
        expect(l.data).toEqual([0x3F, 0x01, 0x56, 0x70, 0x2B, 0x5E, 0x71, 0x2B, 0x72, 0x2B, 0x73, 0x21, 0x46, 0x01, 0x34, 0x21])
        l = new IntelHexLine(':020000040806EC')
        expect(l.data.length).toBe(2)
        expect(l.recordType).toBe(4)
        expect(l.address).toBe(0x0000)
        expect(l.data).toEqual([0x08, 0x06])
        l = new IntelHexLine(':0400000508008879EE')
        expect(l.data.length).toBe(4)
        expect(l.recordType).toBe(5)
        expect(l.address).toBe(0x0000)
        expect(l.data).toEqual([0x08, 0x00, 0x88, 0x79])
        l = new IntelHexLine(':00000001FF')
        expect(l.data.length).toBe(0)
        expect(l.recordType).toBe(1)
        expect(l.address).toBe(0x0000)
        expect(l.data).toEqual([])
    })
})
describe("Line Generator", function () {
    it("Sample", function () {
        expect(IntelHexLine.generateLineString(0x0130, IntelHexRecordType.data, [0x3F, 0x01, 0x56, 0x70, 0x2B, 0x5E, 0x71, 0x2B, 0x72, 0x2B, 0x73, 0x21, 0x46, 0x01, 0x34, 0x21])).toBe(':100130003F0156702B5E712B722B732146013421C7')
        expect(IntelHexLine.generateLineString(0, IntelHexRecordType.extendedLinearAddress, [0x08, 0x06])).toBe(':020000040806EC')
        expect(IntelHexLine.generateLineString(0, IntelHexRecordType.startLinearAddress, [0x08, 0x00, 0x88, 0x79])).toBe(':0400000508008879EE')
        expect(IntelHexLine.generateLineString(0, IntelHexRecordType.endOfFile, [])).toBe(':00000001FF')
    })
})
