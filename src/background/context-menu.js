// Callback reads runtime.lastError to prevent an unchecked error from being
// logged when the extension attempt to register the already-registered menu

import { DEVICE_ID_STORAGE_KEY } from '../shared/consts'
import { createSyncedLink, getDevice, getRegisteredDevices } from './api'

/**
 * @type {import('webextension-polyfill').Menus.CreateCreatePropertiesType}
 */
export const parentMenu = {
	id: 'sendToDeviceMenu',
	title: browser.i18n.getMessage('context_menu__parent_menu_title'),
	contexts: ['link', 'tab'],
}

/**
 * @type {import('webextension-polyfill').Menus.CreateCreatePropertiesType}
 */
export const sendToAllDevicesMenu = {
	id: 'sendToAllDevicesMenu',
	title: browser.i18n.getMessage('context_menu__all_devices_menu_title'),
	parentId: parentMenu['id']
}

/**
 * @type {import('webextension-polyfill').Menus.CreateCreatePropertiesType}
 */
export const manageDevicesMenu = {
	id: 'manageDevicesMenu',
	title: browser.i18n.getMessage('context_menu__manage_devices_title'),
	parentId: parentMenu['id']
}

const deviceMenuIdPrefix = 'deviceId:'

const menuCallback = () => void browser.runtime.lastError


/**
 *
 * @param {import('webextension-polyfill').Menus.OnClickData} info
 * @param {import('webextension-polyfill').Tabs.Tab} tab
 */
function getUrlFromClick(info, tab) {
	// Hope for the best
	return info?.linkUrl || tab?.url
}

export async function createContextMenus() {
	browser.menus.create(parentMenu, menuCallback)

	const { [DEVICE_ID_STORAGE_KEY]: deviceId } = await browser.storage.local.get(DEVICE_ID_STORAGE_KEY)

	const targetableDevices = await getRegisteredDevices().then(devices => devices.filter(d => d.id !== deviceId))

	for (const device of targetableDevices) {
		browser.menus.create({
			parentId: parentMenu['id'],
			title: device.name,
			id: `${deviceMenuIdPrefix}${device.id}`,
		}, menuCallback)
	}

	browser.menus.create({
		id: '_sep',
		type: 'separator',
		parentId: parentMenu['id'],
	}, menuCallback)

	// Send to all devices
	if (targetableDevices.length > 0) {
		browser.menus.create(sendToAllDevicesMenu, menuCallback)
	}

	// Manage devices
	browser.menus.create(manageDevicesMenu, menuCallback)

	// Keep device name up to date
	browser.runtime.onMessage.addListener(async (message) => {
		if (message?.type === 'deviceUpdated' && message?.payload?.id) {
			console.log(`Device update: ${message.payload.id}`)

			const updatedDevice = await getDevice(message.payload.id)

			await browser.menus.update(`${deviceMenuIdPrefix}${updatedDevice.id}`, {
				title: updatedDevice.name
			})
		} else if (message?.type === 'deviceRemoved' && message?.payload?.id) {
			console.log(`Device removed: ${message.payload.id}`)

			await browser.menus.remove(`${deviceMenuIdPrefix}${message.payload.id}`)
		}
	})

	browser.menus.onClicked.addListener(async (info, tab) => {
		switch (info.menuItemId) {
		case manageDevicesMenu['id']:
			await browser.runtime.openOptionsPage()
			break
		case sendToAllDevicesMenu['id']:
			// Send to all devices
			const url = getUrlFromClick(info, tab)
			console.log(`Sending "${url}" to all devices...`)

			if (url && targetableDevices && targetableDevices?.length > 0) {
				for (const device of targetableDevices) {
					await createSyncedLink({
						destinationDeviceId:device.id,
						originDeviceId: deviceId,
						url: url
					})
				}
			}
			break
		default:
			if (info.menuItemId.startsWith(deviceMenuIdPrefix)) {
				const destinationDeviceId = info.menuItemId.slice(deviceMenuIdPrefix.length)
				const url = getUrlFromClick(info, tab)
				console.log(`Sending "${url}" to device "${destinationDeviceId}"...`)

				if (url) {
					await createSyncedLink({
						destinationDeviceId,
						originDeviceId: deviceId,
						url: url
					})
				}
			}
			break
		}
	})
}
