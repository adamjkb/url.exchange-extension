import { mount } from 'svelte'

import App from './popup.svelte'
import { DEVICE_ID_STORAGE_KEY, TOKEN_STORAGE_KEY } from '../shared/consts'


const [storage, activeTabs] = await Promise.all([
	browser.storage.local.get([TOKEN_STORAGE_KEY, DEVICE_ID_STORAGE_KEY]),
	browser.tabs.query({
		active: true,
		currentWindow: true
	})
])


const props = {
	isLoggedIn: !!storage?.[TOKEN_STORAGE_KEY],
	deviceId: storage?.[DEVICE_ID_STORAGE_KEY],
	currentTab: activeTabs?.[0]
}

mount(App, { target: document.getElementById('root'),  props })
