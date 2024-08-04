<script>
	import { createSyncedLink, deleteDevice, getClientInfo, getRegisteredDevices } from '../background/api'
	import { LAST_MSG_TS_STORAGE_KEY } from '../shared/consts'
	import browser from 'webextension-polyfill'
	import InputCheckbox from './components/input-checkbox.svelte'

	class AppState {
		deviceId = $state(null)
		devices = $state([])

		refreshingDevices = $state(false)

		constructor() {
			(async () => {
				// Get storage values

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

	/**
	 * @type {{ isLoggedIn: boolean; currentTab: import('webextension-polyfill').Tabs.Tab }}
	 */
	let { isLoggedIn, deviceId, currentTab } = $props()

	const appState = new AppState({ deviceId })


	let sending = $state(false)
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

	/**
	 * @param {Event} event
	 */
	async function onSubmission(event) {
		event.preventDefault()
		sending = true

		try {
			const formData = new FormData(event.target)
			const selectedDevices = Array.from(formData.entries()).filter(([_, value]) => value === 'on').map(([key]) => key)
			if (selectedDevices.length > 0) {
				for (const selectedDeviceId of selectedDevices) {

					await createSyncedLink({
						originDeviceId: deviceId,
						destinationDeviceId: selectedDeviceId,
						url: currentTab.url
					})
				}
			}
		} catch(err) {
			console.error(err)
		} finally {
			sending = false
		}

		window.close()
	}

</script>
<style>

</style>

<svelte:head>
	<title>{browser.i18n.getMessage('popup_default_title')}</title>
</svelte:head>

<main class='flex min-w-80'>
	<div class='pt-4 p-6 w-full'>
		{#if !isLoggedIn}
			<button
				onclick={openSigninPage}
				type='button'>
				{browser.i18n.getMessage('settings_page__sign_in_label')}
			</button>
		{:else}
			<!-- Other devices -->
			{#if otherDevices && otherDevices.length > 0}
				<section>
					<div class='inline-flex gap-2'>
						<h2 class='text-lg'>
							{browser.i18n.getMessage('popup__device_selection_heading')}
						</h2>
					</div>
					<form
						class='flex flex-col gap-y-2 mt-2'
						action='#'
						onsubmit={onSubmission}>
						{#each otherDevices as device}
							<div class='inline-flex'>
								<InputCheckbox
									name={device.name}
									deviceId={device.id}/>
							</div>
						{/each}
						<button
							class='bg-gray-950 text-white rounded-md mt-1 py-1 px-1'
							type='submit'>
							{#if sending}
								{browser.i18n.getMessage('popup__device_selection_submission_loading_label')}
							{:else}
								{browser.i18n.getMessage('popup__device_selection_submit_label')}
							{/if}
						</button>
					</form>
				</section>
			{/if}
		{/if}
	</div>
</main>
