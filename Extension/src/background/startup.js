import { createConnectionGuard } from './connection-guard.js'
import { createContextMenus } from './context-menu.js'
import { checkDeviceRegistration } from './device.js'
import { handleMissedLinks } from './missed-links.js'
import { createSubscriptions } from './subscriptions.js'

let is_starting_up = false

export async function startup() {
	/**
	 * If the app installed an extension as it started up
	 * reload the extension to avoid double subscription
	 */
	if (is_starting_up) {
		console.log('Updating...')
		browser.runtime.reload()
	}
	is_starting_up = true

	const deviceReady = await checkDeviceRegistration()
	if (deviceReady) {
		await handleMissedLinks()
		createSubscriptions()
		await createContextMenus()
		createConnectionGuard()
	}
}
