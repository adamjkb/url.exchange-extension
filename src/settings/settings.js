import { mount } from 'svelte'

import App from './settings.svelte'
import { DEVICE_ID_STORAGE_KEY, TOKEN_STORAGE_KEY } from '../shared/consts'

const storage = await browser.storage.local.get([TOKEN_STORAGE_KEY, DEVICE_ID_STORAGE_KEY])


mount(App, { target: document.getElementById('root'), props: { isLoggedIn: !!storage?.[TOKEN_STORAGE_KEY], deviceId: storage?.[DEVICE_ID_STORAGE_KEY] } })
