<script>
	import { untrack } from 'svelte'
	import { patchRegisteredDevice } from '../../background/api.js'
	import browser from 'webextension-polyfill'

	let { name: originalName, id } = $props()

	let name = $state(originalName)
	let saving = $state(false)


	// Keep name value updated when parent value changes
	$effect(() => {
		const untrackedName = untrack(() => name)
		if (originalName !== untrackedName) {
			name = originalName
		}
	})

	/**
	 * @param {Event} event
	 */
	async function handleSubmit(event) {
		event.preventDefault()
		try {
			saving = true

			await patchRegisteredDevice(id, {
				name
			})

			originalName = name
			// Signal change in devices
			browser.runtime.sendMessage({ type: 'deviceUpdated', payload: { id } })
		} catch (err) {
			console.error(err)
		} finally {
			saving = false
		}
	}

</script>

<form
	class='inline-flex w-full py-1 px-2 mt-1.5 rounded-md border border-gray-200 focus-within:outline outline-2'
	action='#'
	onsubmit={handleSubmit}>
	<div class='w-full'>
		<label
			class='sr-only'
			for={id}>
			Device
		</label>
		<input
			name='deviceName'
			class='block w-full focus:outline-none'
			minlength={1}
			type='text'
			bind:value={name}>
	</div>
	{#if name !== originalName}
		<button
			class='bg-gray-700 text-white rounded-md text-sm px-2'
			disabled={saving}
			type='submit'>
			{#if saving}
				Saving...
			{:else}
				Save
			{/if}
		</button>
	{/if}
</form>
