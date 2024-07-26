import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source'
import { getAuthorizationHeader, patchSyncedLink } from './api.js'
import { DEVICE_ID_STORAGE_KEY, LAST_MSG_TS_STORAGE_KEY } from '../shared/consts.js'

class RetriableError extends Error { }
class FatalError extends Error { }


async function subscribeDevice() {
	const { [DEVICE_ID_STORAGE_KEY]: deviceId } = await browser.storage.local.get(DEVICE_ID_STORAGE_KEY)

	fetchEventSource(`${API_URL}/sse`, {
		window: null,
		fetch: globalThis.fetch,
		openWhenHidden: true,
		method: 'POST',
		headers: {
			'Authorization': await getAuthorizationHeader(),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ deviceId }),
		keepalive: true,
		async onopen(response) {
			if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
				return // everything's good
			} else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
				// client-side errors are usually non-retriable:
				throw new FatalError()
			} else {
				throw new RetriableError()
			}
		},
		onclose() {
			console.log('closed')
			// if the server closes the connection unexpectedly, retry:
			throw new RetriableError()
		},
		onerror(err) {
			console.error(err)
			if (err instanceof FatalError) {
				throw err // rethrow to stop the operation
			} else {
				// do nothing to automatically retry. You can also
				// return a specific retry interval here.
			}
		},
		onmessage: async (ev) => {
			browser.storage.local.set({ [LAST_MSG_TS_STORAGE_KEY]: new Date().valueOf() })

			if (ev.event === 'message') {
				/** @type {string | null} */
				let linkId = null
				/** @type {URL | null} */
				let incomingUrl = null
				try {
					// Parse message
					const message = JSON.parse(decodeURIComponent(ev.data))
					incomingUrl = new URL(message.url)
					linkId = message.id
				} catch (err) {
					console.error(err)
				}

				if (incomingUrl?.href) {
					// Open tab
					await browser.tabs.create({
						url: incomingUrl.href,
						active: false
					})

					// Send seen receipt
					try {
						await patchSyncedLink(linkId, { seenAt: new Date() })
					} catch (err) {
						console.error(err)
					}
				}
			}
		},
	})
}

export async function createSubscriptions() {
	subscribeDevice()
}
