import { DEVICE_ID_STORAGE_KEY } from '../shared/consts'
import { getSyncedLinks, patchSyncedLink } from './api'

export async function handleMissedLinks() {
	try {
		const {
			[DEVICE_ID_STORAGE_KEY]: deviceId
		 } = await browser.storage.local.get(DEVICE_ID_STORAGE_KEY)

		if (deviceId) {
			const missedLinks = await getSyncedLinks({
				seen: false,
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
