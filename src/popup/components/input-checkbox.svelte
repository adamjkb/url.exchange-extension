<script>
	import Check from '../icons/check.svelte'

	let { deviceId, name } = $props()
</script>
<div class='relative inline-flex items-center w-full input-container group rounded-md border border-gray-200 focus-within:outline outline-2'>
	<div
		class='absolute pointer-events-none left-2 size-6 flex justify-center items-center rounded-full border'
		aria-hidden='true'>
		<Check class='hidden group-has-[input:checked]:block size-4'/>
	</div>
	<input
		id='dev-{deviceId}'
		name={deviceId}
		class='appearance-none'
		type='checkbox'/>
	<label
		class='block w-full py-1 px-2 pl-10 select-none'
		for='dev-{deviceId}'>
		{name}
	</label>
</div>
