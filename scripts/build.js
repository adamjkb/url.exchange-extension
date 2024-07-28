import { context } from 'esbuild'
import sveltePlugin from 'esbuild-svelte'
import { sveltePreprocess } from 'svelte-preprocess'

import AutoImport from 'unplugin-auto-import/esbuild'
import { logBuildPerformance } from './esbuild-plugins.js'

const PROD_BUILD = process.argv.some(arg => arg === '--prod')
const WATCH_MODE = process.argv.some(arg => arg === '--watch')


/**
 * @type {import('esbuild').BuildOptions['plugins']}
 */
const commonPlugins = [
	AutoImport({
		dts: false,
		imports: [{
			from: 'webextension-polyfill',
			// { default as browser }
			imports: [['default', 'browser']]
		}]
	}),
]

/**
 * @type {import('esbuild').BuildOptions}
 */
const commonConfig = {
	outbase: './src',
	platform: 'browser',
	define: {
		'API_URL': '"https://url-exchange.adams.computer"'
	},
	external: [],
	bundle: true,
	format: 'esm',
	minify: PROD_BUILD,
	tsconfig: './jsconfig.json',
}

try {
	const backgroundJobContext = await context({
		...commonConfig,
		entryPoints: ['./src/background/index.js'],
		outfile: './dist/background.js',
		plugins: [
			...commonPlugins,
			logBuildPerformance('background')
		]
	})

	const settingsJobContext = await context({
		...commonConfig,
		entryPoints: ['./src/settings/settings.js'],
		outbase: './src/settings',
		outdir: './dist',
		mainFields: ['svelte', 'module', 'main', 'browser'],
		plugins: [
			sveltePlugin({
				preprocess: sveltePreprocess(),
				compilerOptions: {
					runes: true,
				}
			}),
			...commonPlugins,
			logBuildPerformance('settings')
		]
	})

	if (WATCH_MODE) {
		await backgroundJobContext.watch()
		await settingsJobContext.watch()
	} else {
		// Build
		await backgroundJobContext.rebuild()
		await settingsJobContext.rebuild()

		// Destroy context
		await backgroundJobContext.dispose()
		await settingsJobContext.dispose()

		// Exit sucessful process
		process.exit(0)
	}
} catch (err) {
	console.error(err)
	process.exit(1)
}
