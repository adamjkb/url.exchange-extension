/**
 * @param {import('webextension-polyfill').Menus.CreateCreatePropertiesType} args
 * @return {Promise<void>}
 */
export async function createContextMenuItem(args) {
	return await new Promise((resolve, reject) => {
		browser.contextMenus.create(args, () => {
			if (browser.runtime.lastError) {
				console.error(browser.runtime.lastError)
				reject(browser.runtime.lastError)
			} else {
				resolve()
			}
		})
	})
}
