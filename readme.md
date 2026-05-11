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
- Correctly matches your configured cookies against live browser cookies and displays the current value in real-time, or "No cookie" if absent.
- Set a cookie to any of its predefined values with a single click.
- Remove individual cookies or delete all managed cookies at once.
- Refresh the page without closing Cookie Manager.
- Only one instance of Cookie Manager can be open at a time.
- Dark overlay covering the page while Cookie Manager is open.
- Desktop and mobile view.
- Hovering over "Cookie Manager" in the header shows the app version.
- Hovering over header buttons shows a description of what they do.
- Hovering over a cookie name shows its description (if one was provided).

## Cookie Editor

Click the **gear icon** (⚙) in the header to open the configuration editor.

Each cookie entry has three fields:

| Field | Description |
|---|---|
| **Name** | The actual browser cookie name. No spaces, semicolons, commas, or `=` allowed. |
| **Description** | Optional tooltip shown when hovering the cookie name in the main panel. |
| **Values** | One or more preset values shown as pills. Press **Enter** to add a new value; click **×** to remove one. |

Use **+ Add cookie** to append a new entry. Use **Delete cookie** to remove one. **Drag the grip handle** (⠿) on the left side of an entry to reorder cookies. Click **Cancel** or press **Escape** to discard changes.

Clicking **Accept** re-renders the main panel with the new config for the current session and then shows a **"Update your bookmark"** screen with a new `javascript:` URL containing your config embedded in the code. Copy that URL and replace your bookmark with it — the new bookmark will carry your config everywhere.

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

### Versioning

Update the version in `package.json`. It is automatically read and displayed in the Cookie Manager header tooltip.

### Build output

`npm run build` runs the full check suite and then produces `dist/bookmarklet.js` - a single minified IIFE prefixed with `javascript:`, ready to paste as a bookmark URL. The build will fail on any TypeScript or lint errors.

`public/bookmarklet-template.js` is a dev-only file loaded by `index.html` so the "Update your bookmark" flow works during `npm run dev`. A placeholder is committed so fresh clones don't 404. Because Vite copies everything in `public/` to `dist/` during the build, a copy also appears in `dist/` — it can be ignored, the only meaningful output is `dist/bookmarklet.js`.

## Final Notes

- v1.0 was first released on 14 October 2022. v2.0 introduced the in-browser Cookie Editor and a self-replicating bookmark architecture — the cookie config is embedded directly in the `javascript:` URL, and the app can regenerate that URL with any new config, producing a new standalone bookmark without changing a single line of source code.
- The bookmarklet stores its own minified source as a string (`window.__CM_BOOKMARKLET_TEMPLATE__`). When config changes, that string is used to construct the next URL, carrying itself forward. No `localStorage`, no server, no file format needed.
- Cookie Manager is wrapped in an IIFE so clicking the bookmark multiple times on the same page does not cause re-declaration errors - if an instance is already open, the panel briefly flashes to indicate it is there.
- If Cookie Manager does not appear after clicking the bookmark, check whether page elements have higher `z-index` values than the overlay (`1000000`) and panel (`1000001`). Adjust the values in `_CookieManager.styles.scss` if needed.
- Emotion (CSS-in-JS) was considered but rejected - it added too much boilerplate to the bookmarklet. Plain Sass with `?inline` keeps the output small while still allowing organised, split stylesheets.
