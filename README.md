# url.exchange WebExtension


## Building and running locally

- Make sure you have Node.js 20 or later installed
- Run `npm install --force` (use `--force` due to Svelte 5 pre-release versioning)
- Run `npm run build` or `npm run watch`


### Safari

Do the following steps in Xcode.

Note: “Open the project config” means double-click the app name at the top of the file view in Xcode.

- [Change the Safari app name to your app’s name](https://stackoverflow.com/a/20418989)
- Open `Shared (App)/Models.swift` and update `APP_NAME` with your app's name
- Create a new bundle identifier in the format `com.domain.App-Name` 
	- Open the project config and go to `AppName (iOS)` > Signing & Capabilities and update the bundle id
	- Repeat for the macOS app
- Create a new bundle identifier. It should be your app bundle identifier with `.Extension` added onto the end. So if your app bundle ID is `com.domain.App-Name`, this should be `com.domain.App-Name.Extension`
	- Open the project config and go to `AppName Extension (iOS)` > Signing & Capabilities and update the bundle id with the extension bundle id
	- Repeat for the macOS extension
	- Update `MAC_EXTENSION_BUNDLE_ID` in `Shared (App)/Models.swift` with the extension bundle ID as well
- Update `macOS (App)/AppDelegate.swift` with a help documentation link
- Under project config > Signing & Capabilities, set the team for both apps and both extensions
- Under project config > General, update the display name for iOS and macOS
- Rename both files named `REPLACEME.entitlements` to be `Your App Name.entitlements` 
	- Open the project config and to go to App Name (macOS) > Build Settings and find the setting for “Code Signing Entitlements.” Replace `REPLACEME.entitlements` with the name of your new entitlements file
	- Repeat for App Name Extension (macOS) > Build Settings > Code Signing Entitlements
- Open the project config and go to App Name Extension (macOS) > Build Settings and find the setting for “Bundle Display Name.” Update its value with your app’s name
	- Repeat for App Name Extension (iOS)
- Go to Product > Schemes > Manage Schemes… and update the iOS and macOS schemes with your app’s name
- iOS app icon:
	- Add the app icon to  `iOS (App)/iOS Assets` as `AppIcon` with all the required sizes
	- Add a copy of the app icon named `Icon.png` in `Shared (App)/Resources` 
- macOS app icon
	- Reduce the size of the app icon by 20% while keeping the canvas the same size
	- Add the app icon to `macOS (App)/macOS Assets` as `AppIcon` with all the required sizes

## Building extension

| Browser | Local | Production |
| - | - | - |
| Chrome | `npm run watch` | `npm run zip:extension` |
| Firefox | `npm run watch` | `npm run zip:extension && npm run zip:source` |
| Safari | Product > Build | Product > Archive |

- The Chrome build script generates a zip that can be uploaded to the Chrome Web Store
- The Firefox build script generates a zip for the Mozilla Add-On Store as well as a zip of the source code for the store review


### Firefox

- Open Firefox's [debugging page](about:debugging#/runtime/this-firefox) (`about:debugging#/runtime/this-firefox`)
- Click "Load Temporary Add-on..."
- Navigate to this project's root and select `manifest.json`


## Credits

Initially based on [kyle-n/WebExtensionTemplate](https://github.com/kyle-n/WebExtensionTemplate/tree/main) template
