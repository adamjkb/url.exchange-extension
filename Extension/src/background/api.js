import { TOKEN_STORAGE_KEY } from '../shared/consts.js'

/**
 * @returns {Promise<string>}
 */
export async function getAuthorizationHeader() {
	const token = await browser.storage.local.get(TOKEN_STORAGE_KEY)

	return `Bearer ${token?.[TOKEN_STORAGE_KEY]}`
}


/**
 * @returns {Promise<{ id: string; name: string; createdAt: string; lastUpdatedAt: string; }[]>}
 */
export async function getRegisteredDevices() {
	const response = await fetch(`${API_URL}/api/devices`, {
		headers: {
			'Authorization': await getAuthorizationHeader()
		}
	})

	const result = await response.json()

	return result?.devices
}

/**
 * @param {{ name: string; }} input
 * @returns {Promise<{ id: string; name: string; createdAt: string; lastUpdatedAt: string; }>}
 */
export async function registerDevice(input) {
	const response = await fetch(`${API_URL}/api/devices`, {
		headers: {
			'Authorization': await getAuthorizationHeader()
		},
		method: 'POST',
		body: JSON.stringify(input)
	})

	const result = await response.json()

	return result
}

/**
 * @param {id} id
 * @param {{
 * 	name: string;
 * }} input
 * @returns {Promise<{ id: string; url: string; }>}
 */
export async function patchRegisteredDevice(id, input) {
	const response = await fetch(`${API_URL}/api/devices/${id}`, {
		headers: {
			'Authorization': await getAuthorizationHeader()
		},
		method: 'PATCH',
		body: JSON.stringify(input)
	})

	const result = await response.json()

	return result
}

/**
 * @param {string} deviceId
 * @returns {Promise<{ id: string; name: string; createdAt: string; lastUpdatedAt: string; }>}
 */
export async function getDevice(deviceId) {
	const response = await fetch(`${API_URL}/api/devices/${deviceId}`, {
		headers: {
			'Authorization': await getAuthorizationHeader()
		},
	})

	const result = await response.json()

	return result
}


/**
 * @param {id} id
 * @param {{
 * 	url: string;
 * 	destinationDeviceId: string;
 * 	originDeviceId: string;
 * 	seenAt: Date;
 * }} input
 * @returns {Promise<{ id: string; url: string; }>}
 */
export async function patchSyncedLink(id, input) {
	const response = await fetch(`${API_URL}/api/synced-link/${id}`, {
		headers: {
			'Authorization': await getAuthorizationHeader()
		},
		method: 'PATCH',
		body: JSON.stringify(input)
	})

	const result = await response.json()

	return result
}

/**
 * @param {{
 * 	url: string;
 * 	destinationDeviceId: string;
 * 	originDeviceId: string;
 * }} input
 * @returns {Promise<{ id: string; url: string; }>}
 */
export async function createSyncedLink(input) {
	const response = await fetch(`${API_URL}/api/synced-link`, {
		headers: {
			'Authorization': await getAuthorizationHeader()
		},
		method: 'POST',
		body: JSON.stringify(input)
	})

	const result = await response.json()

	return result
}




/**
 * @param {{ seen?: boolean; destinationDeviceId: string; since: Date }} filters
 * @returns {Promise<{ id: string; url: string;  }[]>}
 */
export async function getSyncedLinks(filters) {
	const params = new URLSearchParams(filters)

	if (filters.since) {
		params.set('since', filters.since.valueOf())
	}


	const response = await fetch(`${API_URL}/api/synced-link?${params.toString()}`, {
		headers: {
			'Authorization': await getAuthorizationHeader()
		},
	})

	const result = await response.json()

	return result?.syncedLinks
}


/**
 * @returns {Promise<{ publicId: string; name: string; createdAt: string; }[]>}
 */
export async function getClientInfo() {
	const response = await fetch(`${API_URL}/api/me`, {
		headers: {
			'Authorization': await getAuthorizationHeader()
		},
	})

	const result = await response.json()

	return result
}

