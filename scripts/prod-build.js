import fs from 'node:fs/promises'
import util from 'node:util'
import { exec as execOriginal } from 'node:child_process'
const exec = util.promisify(execOriginal)


await fs.rm('./dist', { recursive: true })
await fs.mkdir('./dist')
await exec('npm run build -- --prod')

console.log('Finished building')
