/**
 * @param {string} bundleName
 * @return {import('esbuild').Plugin}
 */
export const logBuildPerformance = (bundleName) => ({
	name: 'Build performance',
	setup(build) {
		let buildStart = 0
		build.onStart(() => {
			buildStart = performance.now()
			console.log(`building ${bundleName} bundle...`)
		})
		build.onEnd(() => {
			const duration = performance.now() - buildStart
			console.log(`${bundleName} bundle took ${duration.toFixed(3)}ms to build.`)
		})
	}
})
