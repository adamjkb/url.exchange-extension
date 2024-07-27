import { CONNECTION_GUARD_LAST_RESTART_STORAGE_KEY, CONNECTION_GUARD_NAME, LAST_MSG_TS_STORAGE_KEY } from '../shared/consts'

/**
 * @param {import('webextension-polyfill').Alarms.Alarm} alarm
 */
export async function connectionGuardListener(alarm) {
	if (alarm.name === CONNECTION_GUARD_NAME) {
		const now = new Date().valueOf()
		const { [LAST_MSG_TS_STORAGE_KEY]: lastMessageTs } = await browser.storage.local.get(LAST_MSG_TS_STORAGE_KEY)
		if (lastMessageTs) {
			// If hasn't received a message from the endpoint
			// realod extension to reestablish connection to API
			if (now / 1000 - lastMessageTs / 1000 > 60) {
				console.info('Connection unresponsive, reloading...')
				// Saving for debuging
				await browser.storage.local.set({
					[CONNECTION_GUARD_LAST_RESTART_STORAGE_KEY]: now
				})

				browser.runtime.reload()
			}
		}
	}
}

export function createConnectionGuard() {
	browser.alarms.create(CONNECTION_GUARD_NAME, {
		periodInMinutes: 5
	})
	console.debug('Connection guard created')
}
