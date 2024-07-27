import { TOKEN_STORAGE_KEY } from '../shared/consts.js'


/**
 * Save Token and Close login tab when needed
 * @param {import('webextension-polyfill').WebNavigation.OnBeforeNavigateDetailsType} event
 */
export async function tokenHandler(event) {
	const url = new URL(event.url)
	const token = url.searchParams.get('token')

	// Save token
	if (token) {
		await browser.storage.local.set({
			[TOKEN_STORAGE_KEY]: token
		})


		// Get tabs in windows
		const currentTabs = await browser.tabs.query({
			currentWindow: true
		})
		// Close tab only if it not the last tab in the window
		if (currentTabs.length > 1) {
			await browser.tabs.remove(event.tabId)
		}


		// Restarts extension
		browser.runtime.reload()
	}
}
