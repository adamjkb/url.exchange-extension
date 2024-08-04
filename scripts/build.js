import { context } from 'esbuild'
import sveltePlugin from 'esbuild-svelte'
import { sveltePreprocess } from 'svelte-preprocess'

import AutoImport from 'unplugin-auto-import/esbuild'
import { logBuildPerformance } from './esbuild-plugins.js'

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
			imports: [['default', 'browser']],
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
		'API_URL': '"https://url-exchange.adams.computer"',
		'TARGET': `"${process.env.TARGET}"`
	},
	external: [],
	bundle: true,
	format: 'esm',
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

	const popupJobContext = await context({
		...commonConfig,
		entryPoints: ['./src/popup/popup.js'],
		outbase: './src/popup',
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
			logBuildPerformance('popup')
		]
	})

	if (WATCH_MODE) {
		await backgroundJobContext.watch()
		await settingsJobContext.watch()
		await popupJobContext.watch()
	} else {
		// Build
		await backgroundJobContext.rebuild()
		await settingsJobContext.rebuild()
		await popupJobContext.rebuild()

		// Destroy context
		await backgroundJobContext.dispose()
		await settingsJobContext.dispose()
		await popupJobContext.dispose()

		// Exit sucessful process
		process.exit(0)
	}
} catch (err) {
	console.error(err)
	process.exit(1)
}
