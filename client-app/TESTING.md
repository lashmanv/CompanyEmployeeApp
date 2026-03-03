# Running tests (Karma + Jasmine)

## Chrome / Chromium

Karma launches Chrome. If Chrome is not installed at the default path, the project uses **Puppeteer’s Chromium** when you run `npm test` (via `scripts/run-tests.js`). Run `npm install` first so Puppeteer can download Chromium.

To use your own browser, set `CHROME_BIN` before running tests, e.g.:

```bash
export CHROME_BIN=/path/to/chromium
npm test
```

## Where Karma is configured

- **angular.json** – `projects["client-app"].architect.test`: options for the Karma builder (`include`, `polyfills`, `tsConfig`, etc.). The builder adds its own Karma defaults (reporters, browsers, plugins).
- **karma.conf.js** – Optional override file. Not used by default; to use it, set `"karmaConfig": "karma.conf.js"` in the test options in angular.json.
- **tsconfig.spec.json** – TypeScript config for tests; `include` lists `src/**/*.spec.ts`.

## Run tests

```bash
npm test
# or
ng test
```

With no extra flags, Karma runs in **watch** mode: a browser window opens and the Jasmine Spec Runner (Karma UI) shows the test list. Click **DEBUG** to open the runner in a new tab and see all specs.

To run once and exit (e.g. in CI), use:

```bash
ng test --no-watch --browsers=ChromeHeadless
```

(Requires Chrome/Chromium; set `CHROME_BIN` if needed.)

## Spec files

- `src/app/services/employee.service.spec.ts`
- `src/app/services/company.service.spec.ts`
- `src/app/services/config.service.spec.ts`
- `src/app/services/toast.service.spec.ts`

Pattern: `**/*.spec.ts` under `src/` (configured in angular.json `test.options.include` and tsconfig.spec.json).
