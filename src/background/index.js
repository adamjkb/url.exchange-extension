import { tokenHandler } from './token-handler.js'
import { startup } from './startup.js'
import { connectionGuardListener } from './connection-guard.js'

// Background tasks
browser.runtime.onStartup.addListener(async () => {
	console.debug('Running onStartup...')
	await startup()
})
browser.runtime.onInstalled.addListener(async () => {
	console.debug('Running onInstalled...')
	await startup()
})

browser.alarms.onAlarm.addListener(connectionGuardListener)

// Login Token handling
browser.webNavigation.onBeforeNavigate.addListener(tokenHandler, {
	url: [{
		hostContains: 'url-exchange.adams.computer',
		pathEquals: '/api/passkey/authentication/success'
	}]
})

browser.browserAction.onClicked.addListener(() => {
	browser.runtime.openOptionsPage()
})
