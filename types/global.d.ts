export {}
declare global {
	const browser: typeof import('webextension-polyfill');
	/**
	 * url.exchange API base URL
	 * @readonly
	 */
	const API_URL: string;
	/**
	 * Browser target set at compile time
	 *
	 * @default ""
	 * @readonly
	 */
	const TARGET: "chrome" | "";
}

