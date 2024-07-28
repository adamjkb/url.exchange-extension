import fs from 'node:fs'
import archiver from 'archiver'


// Import extension version
const { version } = JSON.parse(fs.readFileSync('manifest.json', 'utf8'))
const outputFile = fs.createWriteStream(`./url.exchange-source-${version}.zip`)

// End of stream listener
outputFile.on('close', function () {
	console.info(`Successfully packaged extension source code version: ${version}`)
	console.info(outputFile.path)
	console.info(zipper.pointer() + ' total bytes')
})

const zipper = archiver('zip')

zipper.on('error', function (err) { throw err })

zipper.pipe(outputFile)

// Add files and directories to archive
zipper.directory('src')
zipper.directory('static')
zipper.directory('scripts')
zipper.directory('_locales')
zipper.directory('types')
zipper.file('manifest.json')
zipper.file('package.json')
zipper.file('package-lock.json')
zipper.file('.nvmrc')
zipper.file('jsconfig.json')
zipper.file('README.md')
zipper.file('tailwind.config.js')

await zipper.finalize()

