import { DEVICE_ID_STORAGE_KEY, LAST_MSG_TS_STORAGE_KEY } from '../shared/consts'
import { getSyncedLinks, patchSyncedLink } from './api'

export async function handleMissedLinks() {
	try {
		const {
			[DEVICE_ID_STORAGE_KEY]: deviceId,
			[LAST_MSG_TS_STORAGE_KEY]: lastConnectedTs
		 } = await browser.storage.local.get([DEVICE_ID_STORAGE_KEY, LAST_MSG_TS_STORAGE_KEY])

		if (lastConnectedTs) {
			const missedLinks = await getSyncedLinks({
				seen: false,
				since: new Date(lastConnectedTs),
				destinationDeviceId: deviceId
			})

			console.debug(`Number of missed links since last message ${missedLinks.length}`)

			if (missedLinks?.length > 0) {
				for (const link of missedLinks) {
					browser.tabs.create({
						url: new URL(link.url).href,
						active: false
					})

					patchSyncedLink(link.id, { seenAt: new Date() })
				}
			}
		}

	} catch (err) {
		console.error(err)
	}
}
