import { nanoid } from 'nanoid'
import { DEVICE_ID_STORAGE_KEY } from '../shared/consts'
import { getDevice, registerDevice } from './api'
import { UAParser } from 'ua-parser-js'
/**
 * Check if browser has been registered to account
 */
export async function checkDeviceRegistration() {
	let { [DEVICE_ID_STORAGE_KEY]: deviceId  } = await browser.storage.local.get(DEVICE_ID_STORAGE_KEY)

	if (deviceId) {
		const device = await getDevice(deviceId)

		if (!device?.id) {
			deviceId = null
		}
	}

	if (!deviceId) {
		const browserInfo = new UAParser(navigator.userAgent).getBrowser()
		const device = await registerDevice({ name: `${browserInfo.name} (${browserInfo.version}) [${nanoid(5)}]` })
		await browser.storage.local.set({[DEVICE_ID_STORAGE_KEY]: device.id })
	}

	return true
}
