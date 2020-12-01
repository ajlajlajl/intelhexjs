# intelhexjs

[Examples](https://github.com/ajlajlajl/intelhexjs#Examples) |
[Documentation](https://github.com/ajlajlajl/intelhexjs#Documentation) |
[ToDo](https://github.com/ajlajlajl/intelhexjs#ToDo)

[![Build Status](https://travis-ci.org/ajlajlajl/intelhexjs.svg?branch=master)](https://travis-ci.org/ajlajlajl/intelhexjs)

Intel hex file parser and generator. with a few more perks..
for more info on Intel file format visit: [Intel HEX - Wikipedia](https://en.wikipedia.org/wiki/Intel_HEX) or [INTEL HEX FILE FORMAT](https://www.keil.com/support/docs/1584/)

#### Installation
```shell
$ npm i intelhexjs
```

#### Features
  - Load and parse an Intel HEX file to memory chunks
  - Generate an Intel HEX file from memory chunks
  - You can even merge or manipulate HEX files by managing those memory chunks (I was too lazy to add that to my code 🙄)
  - TypeScript defs included (well I tried)
  - Asynchronous using ES6 Promises
  
# Examples
 
#### Loading an Intel HEX File
and spill its guts onto console
```js
const ihex = require('intelhexjs')

ihex.loadIntelHexFile('test1.hex').then(memory => {
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
}).catch(err => {
    console.log('Failed', err)
})
```

#### Saving chunks of bytes as Intel HEX File
I won't ask where you are getting those bytes from
```js
const ihex = require('intelhexjs')
const fs = require('fs/promises')

let data1, data2
fs.readFile('part1.bin').then((data) => {
    data1 = data
    return fs.readFile('part2.bin')
}).then((data) => {
    data2 = data
    let mem = new ihex.Memory([
        new ihex.MemorySection(0x08000000, [...data1]),
        new ihex.MemorySection(0x08060000, [...data2]),
    ])
    mem.startLinearAddress = 0x08008879
    return ihex.generateIntelHexFile('test.hex', mem, {
        architecture: 'b32',
        bytesInOneLine: 32,
    })
}).then(() => {
    console.log('Hex file saved.')
}).catch(err => {
    console.log('Failed', err)
})
```

# Documentation

hope baby, hope ...

# ToDo
  - Merge multiple Hex file
  - Support loading and saving binary files
