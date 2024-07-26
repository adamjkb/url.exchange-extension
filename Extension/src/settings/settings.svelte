<script>
	import { getClientInfo, getRegisteredDevices } from '../background/api'
	import { LAST_MSG_TS_STORAGE_KEY } from '../shared/consts'
	import Device from './components/device.svelte'

	class AppState {
		deviceId = $state(null)
		lastMessageTs = $state(null)
		devices = $state([])
		clientInfo = $state(null)

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

	}

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

<main class='min-h-dvh flex'>
	<div class='p-9'>
		{#if !isLoggedIn}
			<button
				onclick={openSigninPage}
				type='button'>
				Sign in
			</button>
		{:else}
			<div class='flex flex-col h-full'>
				<header class='flex-1'>
					<h1 class='text-2xl'>Settings</h1>

					<!-- This device -->
					{#if thisDevice}
						<section>
							<h2 class='text-xl mt-10'>
								Device name
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
							<h2 class='text-xl mt-10'>
								Other devices
							</h2>
							<div class='flex flex-col gap-y-2'>
								{#each otherDevices as device}
									<Device
										id={device.id}
										name={device.name}/>
								{/each}
							</div>
						</section>
					{/if}


				</header>
				<footer>
					<p class='text-xs text-gray-700'>
						Client ID: {appState.clientInfo?.publicId}
					</p>
					<p class='text-xs text-gray-700'>
						Device ID: {appState.deviceId}
					</p>
					<p class='text-xs text-gray-700'>
						Last message timestamp: {appState.lastMessageTs}
					</p>
				</footer>
			</div>
		{/if}
	</div>
</main>
