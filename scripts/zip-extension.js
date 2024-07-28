import fs from 'node:fs'
import util from 'node:util'
import { exec as execOriginal } from 'node:child_process'
import archiver from 'archiver'
const exec = util.promisify(execOriginal)

// Create fresh build
await exec('npm run build:clean')

// Import extension version
const { version } = JSON.parse(fs.readFileSync('manifest.json', 'utf8'))
const outputFile = fs.createWriteStream(`./url.exchange-${version}.zip`)

// End of stream listener
outputFile.on('close', function () {
	console.info(`Successfully packaged extension version: ${version}`)
	console.info(outputFile.path)
	console.info(zipper.pointer() + ' total bytes')
})

const zipper = archiver('zip')

zipper.on('error', function (err) { throw err })

zipper.pipe(outputFile)

// Add files and directories to archive
zipper.directory('dist')
zipper.directory('static')
zipper.directory('_locales')
zipper.file('manifest.json')

await zipper.finalize()

