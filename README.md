# intelhexjs

[Examples](https://github.com/ajlajlajl/intelhexjs#Examples) |
[Documentation](https://github.com/ajlajlajl/intelhexjs#Documentation) |
[ToDo](https://github.com/ajlajlajl/intelhexjs#ToDo)

Intel hex file parser and generator. with a few more perks..
for more info on Intel file format visit: [Intel HEX - Wikipedia](https://en.wikipedia.org/wiki/Intel_HEX) or [INTEL HEX FILE FORMAT](https://www.keil.com/support/docs/1584/)

####Installation
```shell
$ npm i intelhexjs
```

#### Features
  - Load and parse a Intel HEX file to memory chunks
  - Generate an Intel HEX file from memory chunks
  - You can even merge or manipulate HEX files by managing those memory chunks (I was too lazy to add that to my code 🙄)
  - TS defs included (well I tried)
# Examples
 
#### Loading an Intel HEX File
and spill its guts onto console
```js
try {
    let memory = await loadIntelHexFile(path.join(__dirname, 'test.hex'))
    console.log('Chunks: ', memory.sections.length)
    if (memory.startLinearAddress)
        console.log('Start Linear Address: ', memory.startLinearAddress.toString(16))
    if (memory.startSegmentAddress)
        console.log('Start Segment Address: ', memory.startSegmentAddress.toString(16))
    if (memory.sections.length > 0) {
        memory.sections.forEach((sec, i) => {
            console.log('Section #', i, 'Address:', sec.startAddress.toString(16), 'data:', Buffer.from(sec.data))
        })
    }
} catch (e) {
    console.log('Failed:', e)
}
```

#### Saving chunks of bytes as Intel HEX File
I won't ask where you are getting those bytes from
```js
try {
    let data1 = await fs.readFile(path.join(__dirname, 'part1.bin'))
    let data2 = await fs.readFile(path.join(__dirname, 'part2.bin'))
    let mem = new Memory([
        new MemorySection(0x08000000, [...data1]),
        new MemorySection(0x08060000, [...data2]),
    ])
    mem.startLinearAddress = 0x08008879
    generateIntelHexFile('test.hex', mem, {
        architecture: IntelHexGeneratorOptionsArch.b32,
        bytesInOneLine: 32,
    })
} catch (e) {
    console.log('Failed:', e)
}
```

# Documentation

hope baby, hope ...

# ToDo
  - Merge multiple Hex file
  - Support loading and saving binary files
