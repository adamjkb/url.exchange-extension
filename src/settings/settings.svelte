<script>
	import { deleteDevice, getClientInfo, getRegisteredDevices } from '../background/api'
	import { LAST_MSG_TS_STORAGE_KEY } from '../shared/consts'
	import Device from './components/device.svelte'
	import Refresh from './icons/refresh.svelte'
	import Trash from './icons/trash.svelte'


	class AppState {
		deviceId = $state(null)
		lastMessageTs = $state(null)
		devices = $state([])
		clientInfo = $state(null)

		refreshingDevices = $state(false)

		constructor(init) {
			this.deviceId = init?.deviceId;
			(async () => {
				// Get storage values
				const {
					// [DEVICE_ID_STORAGE_KEY]: deviceId,
					[LAST_MSG_TS_STORAGE_KEY]: lastMessageTs
				} = await browser.storage.local.get([LAST_MSG_TS_STORAGE_KEY])

				this.lastMessageTs = lastMessageTs

				// Get devices
				this.devices = await getRegisteredDevices()
				// Get Client info
				this.clientInfo = await getClientInfo()

			})()

			browser.storage.local.onChanged.addListener((changes) => {
				if (LAST_MSG_TS_STORAGE_KEY in changes) {
					this.lastMessageTs = changes[LAST_MSG_TS_STORAGE_KEY].newValue
				}
			})
		}

		/**
		 * Refresh list of devices
		 */
		refreshDevices = async () => {
			this.refreshingDevices = true
			// Get devices
			this.devices = await getRegisteredDevices()
			this.refreshingDevices = false
		}

		/**
		 * Remove device from list
		 * @param {string} id
		 */
		removeDevie = async (id) => {
			const confirmedIntent = confirm(`Delete device named "${this.devices.find(d => d.id === id).name}"?`)
			if (confirmedIntent) {
				await deleteDevice(id)
				await browser.runtime.sendMessage({ type: 'deviceRemoved', payload: { id } })

				this.devices = this.devices.filter(d => d.id !== id)
			}
		}
	}


	const relativeTimeFormatter = new Intl.RelativeTimeFormat(browser.i18n.getUILanguage(), { numeric: 'auto', style: 'long' })

	let nowTs = $state(new Date().valueOf())
	let timeAgo = $derived.by(() => {
		const secondsAgo = Math.min(Math.round(appState.lastMessageTs / 1000 - nowTs / 1000 ), 0)

		return relativeTimeFormatter.format(secondsAgo, 'seconds')
	})

	$effect(() => {
		const timerId = setInterval(() => {
			nowTs = new Date().valueOf()
		}, 1000)

		return () => {
			clearInterval(timerId)
		}
	})

	/**
	 * @type {{ isLoggedIn: boolean; }}
	 */
	let { isLoggedIn, deviceId } = $props()

	const appState = new AppState({ deviceId })


	let thisDevice = $derived.by(() => appState.devices.find(dev => dev.id === deviceId))
	let otherDevices = $derived.by(() => appState.devices.filter(dev => dev.id !== deviceId))

	async function openSigninPage() {
		const hasPermission =  await browser.permissions.request({
			origins: ['*://url-exchange.adams.computer/*']
		})

		if (hasPermission) {
			await browser.tabs.create({
				url: `${API_URL}/extension/signin`
			})
		}
	}
</script>
<style>

</style>

<svelte:head>
	<title>url.exchange | {browser.i18n.getMessage('settings_page__window_title')}</title>
</svelte:head>

<main class='min-h-dvh flex'>
	<div class='p-9'>
		{#if !isLoggedIn}
			<button
				onclick={openSigninPage}
				type='button'>
				{browser.i18n.getMessage('settings_page__sign_in_label')}
			</button>
		{:else}
			<div class='flex flex-col h-full'>
				<header class='flex-1'>
					<h1 class='text-2xl'>
						{browser.i18n.getMessage('settings_page__heading')}
					</h1>

					<!-- This device -->
					{#if thisDevice}
						<section>
							<h2 class='text-xl mt-10'>
								{browser.i18n.getMessage('settings_page__device_heading')}
							</h2>
							<div class='flex flex-col gap-y-2'>
								<Device
									id={thisDevice.id}
									name={thisDevice.name}/>
							</div>
						</section>
					{/if}

					<!-- Other devices -->
					{#if otherDevices && otherDevices.length > 0}
						<section>
							<div class='inline-flex mt-10 gap-2'>
								<h2 class='text-lg'>
									{browser.i18n.getMessage('settings_page__other_devices_heading')}
								</h2>
								<button
									class:animate-spin={appState.refreshingDevices}
									aria-label={browser.i18n.getMessage('settings_page__refresh_devices_label')}
									onclick={appState.refreshDevices}
									type='button'>
									<Refresh class='size-4'/>
								</button>
							</div>
							<div class='flex flex-col gap-y-2'>
								{#each otherDevices as device}
									<div class='inline-flex'>
										<Device
											id={device.id}
											name={device.name}/>
										<button
											class='hover:text-red-700 ml-2'
											aria-label={browser.i18n.getMessage('settings_page__remove_device_label')}
											onclick={() => appState.removeDevie(device.id)}
											type='button'>
											<Trash class='size-5'/>
										</button>
									</div>
								{/each}
							</div>
						</section>
					{/if}


				</header>
				<footer>
					<p class='text-xs text-gray-700'>
						{browser.i18n.getMessage('settings_page__footer_client_info', appState.clientInfo?.publicId)}
					</p>
					<p class='text-xs text-gray-700'>
						{browser.i18n.getMessage('settings_page__footer_device_info', appState.deviceId)}
					</p>
					<p class='text-xs text-gray-700'>
						{browser.i18n.getMessage('settings_page__footer_last_message_info', timeAgo)}
					</p>
				</footer>
			</div>
		{/if}
	</div>
</main>
