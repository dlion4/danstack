// Bootstrap's prebuilt bundle ships no type declarations. A static side-effect
// import doesn't need them, but the browser-only dynamic `import()` we use to
// avoid the SSR `document is not defined` crash resolves the module's type, so
// declare it here to keep TypeScript happy across all pages.
declare module 'bootstrap/dist/js/bootstrap.bundle.min.js';
