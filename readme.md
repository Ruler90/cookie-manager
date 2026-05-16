# Cookie Manager

Customizable Cookie Manager for development purposes - configure which cookies to track directly in the browser UI, without touching any code.  
Cookie Manager runs as a Bookmarklet (a browser bookmark that executes JavaScript) so you can quickly launch it on any page.

## Quick start

To use Cookie Manager, simply:

1. Open the [bookmarklet.js](dist/bookmarklet.js) file.
2. Copy the entire code (on GitHub use "Copy raw contents").
3. Create a new bookmark in your browser and paste the code as the URL.
4. Click the bookmark on any page.

On first use, Cookie Manager will start with three example cookies. Use the gear icon to configure your own cookies (see [Cookie Editor](#cookie-editor)).

## Features

- **In-browser cookie configuration** - add, edit and remove tracked cookies without editing any source files (see [Cookie Editor](#cookie-editor)).
- **Portable config** - your cookie list is embedded directly in the bookmark URL. It works on every domain, in incognito windows, and in any browser where you save the bookmark - no server, no file, no import step.
- Correctly matches your configured cookies against live browser cookies and shows `● set` / `not set` status per row in real-time.
- Active preset value is highlighted in the pill row so you can see the current state at a glance.
- Set a cookie to any of its predefined values with a single click.
- Remove individual cookies or delete all managed cookies at once.
- Refresh the page without closing Cookie Manager.
- Only one instance of Cookie Manager can be open at a time.
- Dark overlay covering the page while Cookie Manager is open.
- Desktop and mobile view.
- Footer shows the number of tracked cookies and the app version.
- Hovering over "Cookie Manager" in the header shows the full app version.
- Hovering over header buttons shows a description of what they do.
- Click the **i** button next to a cookie's status to reveal its description (if one was provided). Multiple rows can be open at the same time.

## Cookie Editor

Click the **gear icon** (⚙) in the header to open the configuration editor.

Each cookie entry has three fields:

| Field | Description |
|---|---|
| **Name** | The actual browser cookie name. No spaces, semicolons, commas, or `=` allowed. |
| **Note** | Optional description revealed in the main panel when the **i** button is clicked next to that cookie's row. |
| **Values** | One or more preset values shown as pills. Press **Enter** to add a new value; click **×** to remove one. |

Use **+ Add cookie** to append a new entry (it appears highlighted in indigo to mark it as new). To remove an entry click **Delete cookie** — an inline confirmation row appears; click **Delete** again to confirm or **Cancel** to dismiss. **Drag the grip handle** on the left side of an entry to reorder cookies. Click **Cancel** or press **Escape** to discard all changes.

The header shows an **Unsaved** badge and the footer shows `· unsaved changes` as soon as you make any edit. **Accept** is disabled until at least one change has been made. Clicking **Accept** re-renders the main panel with the new config for the current session and then shows a **"Update your bookmark"** screen with a new `javascript:` URL containing your config embedded in the code. Copy that URL and replace your bookmark with it — the new bookmark will carry your config everywhere.

The bookmarklet is self-replicating: every generated URL is a complete, standalone copy of the app with your config baked in, and that copy can generate further updated URLs the same way.

On first use (before any config has been saved), Cookie Manager starts with three placeholder cookies as a starting point.

## Development

- Works with Node `22.15.0`
- `npm i`
- `npm run dev` - Vite launches a dev server with hot module reloading. After closing Cookie Manager, refresh the page to reopen it.

### Styles

SCSS partials for each component live inside their respective component folders. They are all imported into [`src/styles/styles.scss`](src/styles/styles.scss), which Vite compiles and inlines via the `?inline` import in [`app.ts`](src/app.ts). No manual SCSS compilation step is needed during development.

Cookie Manager intentionally uses minimal base styling so it inherits fonts and other properties from the host page. Adjust the `.scss` partials if you need to override anything.

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check, lint, and produce `dist/bookmarklet.js` |
| `npm run check` | Run TypeScript and ESLint checks only |
| `npm run ts` | TypeScript check only (`tsc --noEmit`) |
| `npm run lint` | ESLint only |
| `npm run css` | Compile `styles.scss` → `styles.css` as a standalone file (for inspection only - not used by the build) |
| `npm test` | Run the unit test suite once |
| `npm run test:watch` | Run tests in watch mode |

### Tests

Unit tests use [Vitest](https://vitest.dev/) with jsdom. Test files live in `src/__tests__/` and mirror the source structure:

```
src/__tests__/
├── setup.ts                    Global afterEach cleanup; jsdom stubs for scrollIntoView, DataTransfer, DragEvent
├── App.test.ts                 Integration — IIFE rendering, footer count, flash behaviour
├── utils/
│   ├── escapeHtml.test.ts
│   ├── cookieUtils.test.ts
│   ├── siteCookies.test.ts
│   └── cookieStorage.test.ts
└── components/
    ├── ItemBtns.test.ts        addCookie, deleteCookie, itemButtons
    ├── ItemInfo.test.ts        showCookieValue, itemInfo
    ├── HeaderActions.test.ts   closeCookieManager, deleteAllCookies, refresh
    ├── validateCookies.test.ts collectAndValidate — all validation rules
    ├── dragReorder.test.ts     setupDragReorder — DOM reorder, indicator classes
    └── CookieEditor.test.ts    Full editor — open, dirty state, cancel, accept, CRUD, pills, clipboard
```

### Versioning

Update the version in `package.json`. It is automatically read and displayed in the Cookie Manager header tooltip and in the panel footer.

### Build output

`npm run build` runs the full check suite and then produces `dist/bookmarklet.js` - a single minified IIFE prefixed with `javascript:`, ready to paste as a bookmark URL. The build will fail on any TypeScript or lint errors.

`public/bookmarklet-template.js` is a dev-only file loaded by `index.html` so the "Update your bookmark" flow works during `npm run dev`. A placeholder is committed so fresh clones don't 404. Because Vite copies everything in `public/` to `dist/` during the build, a copy also appears in `dist/` — it can be ignored, the only meaningful output is `dist/bookmarklet.js`.

## Final Notes

- v1.0 was first released on 14 October 2022. v2.0 introduced the in-browser Cookie Editor and a self-replicating bookmark architecture — the cookie config is embedded directly in the `javascript:` URL, and the app can regenerate that URL with any new config, producing a new standalone bookmark without changing a single line of source code.
- The bookmarklet stores its own minified source as a string (`window.__CM_BOOKMARKLET_TEMPLATE__`). When config changes, that string is used to construct the next URL, carrying itself forward. No `localStorage`, no server, no file format needed.
- Cookie Manager is wrapped in an IIFE so clicking the bookmark multiple times on the same page does not cause re-declaration errors - if an instance is already open, the panel briefly flashes to indicate it is there.
- If Cookie Manager does not appear after clicking the bookmark, check whether page elements have higher `z-index` values than the overlay (`1000000`) and panel (`1000001`). Adjust the values in `_CookieManager.styles.scss` if needed.
- Emotion (CSS-in-JS) was considered but rejected - it added too much boilerplate to the bookmarklet. Plain Sass with `?inline` keeps the output small while still allowing organised, split stylesheets.
- The Cookie Editor's "unsaved changes" state has a known cosmetic quirk: clicking the **Delete cookie** button or anywhere inside the values pill container can trigger the dirty state even before any data has actually changed. The root cause is that the `MutationObserver` tracking dirty state reacts to any `childList` mutation in the editor body — including the delete-confirmation message being injected into the DOM and the value-count label (`valueMeta.textContent`) being rewritten on each click even when the count has not changed. Two fixes were considered: (1) filtering the `MutationObserver` callback to only react to `.mw-ce__pill` / `.mw-ce__entry` element additions and removals, or (2) removing the observer entirely and calling `markDirty()` explicitly from `buildPill` and `buildEntry` via an injected callback. Option 1 keeps dirty-tracking logic in one place (`openCookieEditor`) at the cost of a slightly larger callback. Option 2 eliminates the observer but spreads the concern across three functions and makes their signatures aware of parent state. Given the bookmarklet's size constraints and readability goals, neither change was judged to offer enough benefit to justify the trade-off at this time.
