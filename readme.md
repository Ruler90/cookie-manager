# Cookie Manager

Customizable Cookie Manager where you can put just the cookies that you usually modify (e.g. for development purposes).  
Cookie Manager can be used as a Bookmarklet (browser bookmark the executes JavaScript code) so you can quickly run it in every browser.

## Quick start

To use Cookie Manager, simply:

1. Open the [bookmarklet.js](build/bookmarklet.js) file.
2. Copy the entire code (there is an option on GitHub: "copy raw contents").
3. Create a new bookmark in your browser and paste the code as an URL.
4. Use the bookmark.

## Features

- Only you decide what cookies and their values will be handled by Cookie Manager (check the [Development section](#development)).
- Correctly matches developer cookies with cookies in the browser and displays the status in real-time - either providing the value or indicating that the cookie does not exist in the browser.
- Opening and closing the Cookie Manager without refreshing the page.
- Refreshing the page using a button.
- Deleting all cookies managed by Cookie Manager with one click.
- Only one instance of Cookie Manager can be opened at a time.
- Dark overlay covering the page as long as Cookie Manager is open.
- Desktop and mobile view.
- Hovering over the "Cookie Manager" name shows the app version.
- Hovering over the header buttons shows the description what they do.
- Hovering over the cookie name shows what the cookie do (if a description exists).

## Development

- `npm i`
- `npm run start`
- Webpack Dev Server will launch, allowing you to see changes live. After closing Cookie Manager, refresh the page to make it appear again.
- The entire mechanism is based on the [devCookiesList](src/utils/devCookies.ts) variable, which you modify as needed. The content of Cookie Manager is generated based on that file.
- You can find styles (.scss partials) for different parts of Cookie Manager are inside the folders with the components. All of them are imported into the main [styles.module.scss](src/styles/styles.module.scss) file, which is compiled into a .css file and imported in [index.ts](src/index.ts).
- I used as little styling as possible so Cookie Manager should, for example, use the fonts used on a site where you ran the app. If there are any inconsistencies or something is not right, you can update the styles to meet your expectations.
- Update the app version in `package.json` - it is fetched from there and inserted into the `title` in the header.
- Webpack will regenerate the [main.bundle.js](build/main.bundle.js) file with minified code on every change.
- Copy the content of that file, then open [bookmarklet.js](build/bookmarklet.js), add `javascript:` at the beginning and paste the minified code.
- Now you developed your customized version of Cookie Manager and you can use it as in the [Quick Start](#quick-start) section.

## Final Notes

- The first version of this project was released on the 14th of October 2022.
- Cookie Manager JS/TS code is an IIFE function, allowing it to be executed multiple times without reloading the page. If it were a regular function + its invocation, using it a second time would show an error that we are trying to declare the function again.
- If Cookie Manager does not appear on the page, and subsequent clicks indicate it is already running, check if page elements don't have higher `z-indexes` than Cookie Manager. In that case they could simply cover the app.
- I tried using emotion (CSS-in-JS) here but it generated too much boilerplate, so I stuck with plain Sass to include as little code in the bookmarklet as possible while being able to divide styles for code organization purpose. Webpack recognizes .css files thanks to:
    ```js
    {
        test: /\.css/,
        type: 'asset/source',
    },
    ```
