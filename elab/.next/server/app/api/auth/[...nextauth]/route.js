"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "node:buffer":
/*!******************************!*\
  !*** external "node:buffer" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:buffer");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:crypto");

/***/ }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:util");

/***/ }),

/***/ "(rsc)/./node_modules/.pnpm/next@14.2.31_@babel+core@7.29.7_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2Fworkspaces%2FPigeon-lab%2Felab%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fworkspaces%2FPigeon-lab%2Felab&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@14.2.31_@babel+core@7.29.7_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2Fworkspaces%2FPigeon-lab%2Felab%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fworkspaces%2FPigeon-lab%2Felab&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/.pnpm/next@14.2.31_@babel+core@7.29.7_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/.pnpm/next@14.2.31_@babel+core@7.29.7_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/.pnpm/next@14.2.31_@babel+core@7.29.7_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _workspaces_Pigeon_lab_elab_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"standalone\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"/workspaces/Pigeon-lab/elab/app/api/auth/[...nextauth]/route.ts\",\n    nextConfigOutput,\n    userland: _workspaces_Pigeon_lab_elab_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/[...nextauth]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vbmV4dEAxNC4yLjMxX0BiYWJlbCtjb3JlQDcuMjkuN19yZWFjdC1kb21AMTguMy4xX3JlYWN0QDE4LjMuMV9fcmVhY3RAMTguMy4xL25vZGVfbW9kdWxlcy9uZXh0L2Rpc3QvYnVpbGQvd2VicGFjay9sb2FkZXJzL25leHQtYXBwLWxvYWRlci5qcz9uYW1lPWFwcCUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGYXV0aCUyRiU1Qi4uLm5leHRhdXRoJTVEJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGYXV0aCUyRiU1Qi4uLm5leHRhdXRoJTVEJTJGcm91dGUudHMmYXBwRGlyPSUyRndvcmtzcGFjZXMlMkZQaWdlb24tbGFiJTJGZWxhYiUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGd29ya3NwYWNlcyUyRlBpZ2Vvbi1sYWIlMkZlbGFiJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PXN0YW5kYWxvbmUmcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDZTtBQUM1RjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL3BpZ2VvbmxhYi1uZXh0Lz8wMjNjIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi93b3Jrc3BhY2VzL1BpZ2Vvbi1sYWIvZWxhYi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJzdGFuZGFsb25lXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2F1dGgvWy4uLm5leHRhdXRoXVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL3dvcmtzcGFjZXMvUGlnZW9uLWxhYi9lbGFiL2FwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/next@14.2.31_@babel+core@7.29.7_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2Fworkspaces%2FPigeon-lab%2Felab%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fworkspaces%2FPigeon-lab%2Felab&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.ts":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.ts\");\n\nconst { GET, POST } = _lib_auth__WEBPACK_IMPORTED_MODULE_0__.handlers;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBc0M7QUFDL0IsTUFBTSxFQUFFQyxHQUFHLEVBQUVDLElBQUksRUFBRSxHQUFHRiwrQ0FBUUEsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3BpZ2VvbmxhYi1uZXh0Ly4vYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHM/YzhhNCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBoYW5kbGVycyB9IGZyb20gXCJAL2xpYi9hdXRoXCI7XG5leHBvcnQgY29uc3QgeyBHRVQsIFBPU1QgfSA9IGhhbmRsZXJzO1xuIl0sIm5hbWVzIjpbImhhbmRsZXJzIiwiR0VUIiwiUE9TVCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth.ts":
/*!*********************!*\
  !*** ./lib/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   auth: () => (/* binding */ auth),\n/* harmony export */   handlers: () => (/* binding */ handlers),\n/* harmony export */   requireRole: () => (/* binding */ requireRole),\n/* harmony export */   requireSameSchool: () => (/* binding */ requireSameSchool),\n/* harmony export */   requireSchoolAdmin: () => (/* binding */ requireSchoolAdmin),\n/* harmony export */   requireUser: () => (/* binding */ requireUser),\n/* harmony export */   signIn: () => (/* binding */ signIn),\n/* harmony export */   signOut: () => (/* binding */ signOut)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/.pnpm/next-auth@5.0.0-beta.25_next@14.2.31_@babel+core@7.29.7_react-dom@18.3.1_react@18.3.1__react@18.3.1__react@18.3.1/node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/.pnpm/next-auth@5.0.0-beta.25_next@14.2.31_@babel+core@7.29.7_react-dom@18.3.1_react@18.3.1__react@18.3.1__react@18.3.1/node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/.pnpm/next-auth@5.0.0-beta.25_next@14.2.31_@babel+core@7.29.7_react-dom@18.3.1_react@18.3.1__react@18.3.1__react@18.3.1/node_modules/next-auth/providers/google.js\");\n/* harmony import */ var _auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @auth/prisma-adapter */ \"(rsc)/./node_modules/.pnpm/@auth+prisma-adapter@2.11.3_@prisma+client@5.22.0_prisma@5.22.0_/node_modules/@auth/prisma-adapter/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/.pnpm/bcryptjs@2.4.3/node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_6__);\n\n\n\n\n\n\n\nconst { handlers, auth, signIn, signOut } = (0,next_auth__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n    adapter: (0,_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_3__.PrismaAdapter)(_lib_prisma__WEBPACK_IMPORTED_MODULE_5__.prisma),\n    session: {\n        strategy: \"jwt\"\n    },\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"Email and password\",\n            credentials: {\n                email: {},\n                password: {}\n            },\n            async authorize (c) {\n                const email = String(c?.email || \"\").toLowerCase();\n                const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_5__.prisma.user.findUnique({\n                    where: {\n                        email\n                    },\n                    include: {\n                        profile: true,\n                        roles: true\n                    }\n                });\n                if (!user?.passwordHash || !await bcryptjs__WEBPACK_IMPORTED_MODULE_4___default().compare(String(c?.password || \"\"), user.passwordHash)) return null;\n                return {\n                    id: user.id,\n                    email: user.email,\n                    name: user.profile?.fullName,\n                    roles: user.roles.map((r)=>r.role),\n                    schoolId: user.profile?.schoolId\n                };\n            }\n        }),\n        (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_2__[\"default\"])({\n            clientId: process.env.GOOGLE_CLIENT_ID || \"\",\n            clientSecret: process.env.GOOGLE_CLIENT_SECRET || \"\"\n        })\n    ],\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user?.id) {\n                const data = await _lib_prisma__WEBPACK_IMPORTED_MODULE_5__.prisma.user.findUnique({\n                    where: {\n                        id: user.id\n                    },\n                    include: {\n                        profile: true,\n                        roles: true\n                    }\n                });\n                token.roles = data?.roles.map((r)=>r.role) || [];\n                token.schoolId = data?.profile?.schoolId || null;\n            }\n            return token;\n        },\n        session ({ session, token }) {\n            session.user.id = token.sub;\n            session.user.roles = token.roles || [];\n            session.user.schoolId = token.schoolId;\n            return session;\n        }\n    }\n});\nasync function requireUser() {\n    const session = await auth();\n    if (!session?.user?.id) throw new Error(\"Unauthorized\");\n    return session.user;\n}\nasync function requireRole(role) {\n    const user = await requireUser();\n    if (!user.roles?.includes(role)) throw new Error(\"Forbidden\");\n    return user;\n}\nasync function requireSchoolAdmin() {\n    return requireRole(_prisma_client__WEBPACK_IMPORTED_MODULE_6__.AppRole.school_admin);\n}\nasync function requireSameSchool(schoolId) {\n    const user = await requireUser();\n    if (user.schoolId !== schoolId && !user.roles?.includes(_prisma_client__WEBPACK_IMPORTED_MODULE_6__.AppRole.super_admin)) throw new Error(\"Forbidden\");\n    return user;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QjtJQUF1QixPQUFPRixZQUFZNUMsbURBQU9BLENBQUMrQyxZQUFZO0FBQUc7QUFDaEYsZUFBZUMsa0JBQWtCbEIsUUFBZ0I7SUFBSSxNQUFNYixPQUFPLE1BQU15QjtJQUFlLElBQUl6QixLQUFLYSxRQUFRLEtBQUtBLFlBQVksQ0FBQ2IsS0FBS0ssS0FBSyxFQUFFdUIsU0FBUzdDLG1EQUFPQSxDQUFDaUQsV0FBVyxHQUFHLE1BQU0sSUFBSU4sTUFBTTtJQUFjLE9BQU8xQjtBQUFNIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGlnZW9ubGFiLW5leHQvLi9saWIvYXV0aC50cz9iZjdlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXh0QXV0aCBmcm9tIFwibmV4dC1hdXRoXCI7XG5pbXBvcnQgQ3JlZGVudGlhbHMgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvY3JlZGVudGlhbHNcIjtcbmltcG9ydCBHb29nbGUgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvZ29vZ2xlXCI7XG5pbXBvcnQgeyBQcmlzbWFBZGFwdGVyIH0gZnJvbSBcIkBhdXRoL3ByaXNtYS1hZGFwdGVyXCI7XG5pbXBvcnQgYmNyeXB0IGZyb20gXCJiY3J5cHRqc1wiO1xuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSBcIkAvbGliL3ByaXNtYVwiO1xuaW1wb3J0IHsgQXBwUm9sZSB9IGZyb20gXCJAcHJpc21hL2NsaWVudFwiO1xuXG5leHBvcnQgY29uc3QgeyBoYW5kbGVycywgYXV0aCwgc2lnbkluLCBzaWduT3V0IH0gPSBOZXh0QXV0aCh7XG4gIGFkYXB0ZXI6IFByaXNtYUFkYXB0ZXIocHJpc21hKSwgc2Vzc2lvbjogeyBzdHJhdGVneTogXCJqd3RcIiB9LFxuICBwcm92aWRlcnM6IFtDcmVkZW50aWFscyh7IG5hbWU6IFwiRW1haWwgYW5kIHBhc3N3b3JkXCIsIGNyZWRlbnRpYWxzOiB7IGVtYWlsOiB7fSwgcGFzc3dvcmQ6IHt9IH0sIGFzeW5jIGF1dGhvcml6ZShjKSB7IGNvbnN0IGVtYWlsID0gU3RyaW5nKGM/LmVtYWlsIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCk7IGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHsgd2hlcmU6IHsgZW1haWwgfSwgaW5jbHVkZTogeyBwcm9maWxlOiB0cnVlLCByb2xlczogdHJ1ZSB9IH0pOyBpZiAoIXVzZXI/LnBhc3N3b3JkSGFzaCB8fCAhYXdhaXQgYmNyeXB0LmNvbXBhcmUoU3RyaW5nKGM/LnBhc3N3b3JkIHx8IFwiXCIpLCB1c2VyLnBhc3N3b3JkSGFzaCkpIHJldHVybiBudWxsOyByZXR1cm4geyBpZDogdXNlci5pZCwgZW1haWw6IHVzZXIuZW1haWwsIG5hbWU6IHVzZXIucHJvZmlsZT8uZnVsbE5hbWUsIHJvbGVzOiB1c2VyLnJvbGVzLm1hcChyID0+IHIucm9sZSksIHNjaG9vbElkOiB1c2VyLnByb2ZpbGU/LnNjaG9vbElkIH07IH0gfSksIEdvb2dsZSh7IGNsaWVudElkOiBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX0lEIHx8IFwiXCIsIGNsaWVudFNlY3JldDogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9TRUNSRVQgfHwgXCJcIiB9KV0sXG4gIGNhbGxiYWNrczogeyBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9KSB7IGlmICh1c2VyPy5pZCkgeyBjb25zdCBkYXRhID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7IHdoZXJlOiB7IGlkOiB1c2VyLmlkIH0sIGluY2x1ZGU6IHsgcHJvZmlsZTogdHJ1ZSwgcm9sZXM6IHRydWUgfSB9KTsgdG9rZW4ucm9sZXMgPSBkYXRhPy5yb2xlcy5tYXAociA9PiByLnJvbGUpIHx8IFtdOyB0b2tlbi5zY2hvb2xJZCA9IGRhdGE/LnByb2ZpbGU/LnNjaG9vbElkIHx8IG51bGw7IH0gcmV0dXJuIHRva2VuOyB9LCBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkgeyBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5zdWIhOyBzZXNzaW9uLnVzZXIucm9sZXMgPSAodG9rZW4ucm9sZXMgfHwgW10pIGFzIEFwcFJvbGVbXTsgc2Vzc2lvbi51c2VyLnNjaG9vbElkID0gdG9rZW4uc2Nob29sSWQgYXMgc3RyaW5nIHwgbnVsbDsgcmV0dXJuIHNlc3Npb247IH0gfVxufSk7XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVxdWlyZVVzZXIoKSB7IGNvbnN0IHNlc3Npb24gPSBhd2FpdCBhdXRoKCk7IGlmICghc2Vzc2lvbj8udXNlcj8uaWQpIHRocm93IG5ldyBFcnJvcihcIlVuYXV0aG9yaXplZFwiKTsgcmV0dXJuIHNlc3Npb24udXNlcjsgfVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlcXVpcmVSb2xlKHJvbGU6IEFwcFJvbGUpIHsgY29uc3QgdXNlciA9IGF3YWl0IHJlcXVpcmVVc2VyKCk7IGlmICghdXNlci5yb2xlcz8uaW5jbHVkZXMocm9sZSkpIHRocm93IG5ldyBFcnJvcihcIkZvcmJpZGRlblwiKTsgcmV0dXJuIHVzZXI7IH1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXF1aXJlU2Nob29sQWRtaW4oKSB7IHJldHVybiByZXF1aXJlUm9sZShBcHBSb2xlLnNjaG9vbF9hZG1pbik7IH1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXF1aXJlU2FtZVNjaG9vbChzY2hvb2xJZDogc3RyaW5nKSB7IGNvbnN0IHVzZXIgPSBhd2FpdCByZXF1aXJlVXNlcigpOyBpZiAodXNlci5zY2hvb2xJZCAhPT0gc2Nob29sSWQgJiYgIXVzZXIucm9sZXM/LmluY2x1ZGVzKEFwcFJvbGUuc3VwZXJfYWRtaW4pKSB0aHJvdyBuZXcgRXJyb3IoXCJGb3JiaWRkZW5cIik7IHJldHVybiB1c2VyOyB9XG4iXSwibmFtZXMiOlsiTmV4dEF1dGgiLCJDcmVkZW50aWFscyIsIkdvb2dsZSIsIlByaXNtYUFkYXB0ZXIiLCJiY3J5cHQiLCJwcmlzbWEiLCJBcHBSb2xlIiwiaGFuZGxlcnMiLCJhdXRoIiwic2lnbkluIiwic2lnbk91dCIsImFkYXB0ZXIiLCJzZXNzaW9uIiwic3RyYXRlZ3kiLCJwcm92aWRlcnMiLCJuYW1lIiwiY3JlZGVudGlhbHMiLCJlbWFpbCIsInBhc3N3b3JkIiwiYXV0aG9yaXplIiwiYyIsIlN0cmluZyIsInRvTG93ZXJDYXNlIiwidXNlciIsImZpbmRVbmlxdWUiLCJ3aGVyZSIsImluY2x1ZGUiLCJwcm9maWxlIiwicm9sZXMiLCJwYXNzd29yZEhhc2giLCJjb21wYXJlIiwiaWQiLCJmdWxsTmFtZSIsIm1hcCIsInIiLCJyb2xlIiwic2Nob29sSWQiLCJjbGllbnRJZCIsInByb2Nlc3MiLCJlbnYiLCJHT09HTEVfQ0xJRU5UX0lEIiwiY2xpZW50U2VjcmV0IiwiR09PR0xFX0NMSUVOVF9TRUNSRVQiLCJjYWxsYmFja3MiLCJqd3QiLCJ0b2tlbiIsImRhdGEiLCJzdWIiLCJyZXF1aXJlVXNlciIsIkVycm9yIiwicmVxdWlyZVJvbGUiLCJpbmNsdWRlcyIsInJlcXVpcmVTY2hvb2xBZG1pbiIsInNjaG9vbF9hZG1pbiIsInJlcXVpcmVTYW1lU2Nob29sIiwic3VwZXJfYWRtaW4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE4QztBQUM5QyxNQUFNQyxrQkFBa0JDO0FBQ2pCLE1BQU1DLFNBQVNGLGdCQUFnQkUsTUFBTSxJQUFJLElBQUlILHdEQUFZQSxHQUFHO0FBQ25FLElBQUlJLElBQXFDLEVBQUVILGdCQUFnQkUsTUFBTSxHQUFHQSIsInNvdXJjZXMiOlsid2VicGFjazovL3BpZ2VvbmxhYi1uZXh0Ly4vbGliL3ByaXNtYS50cz85ODIyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gXCJAcHJpc21hL2NsaWVudFwiO1xuY29uc3QgZ2xvYmFsRm9yUHJpc21hID0gZ2xvYmFsVGhpcyBhcyB1bmtub3duIGFzIHsgcHJpc21hPzogUHJpc21hQ2xpZW50IH07XG5leHBvcnQgY29uc3QgcHJpc21hID0gZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA/PyBuZXcgUHJpc21hQ2xpZW50KCk7XG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKSBnbG9iYWxGb3JQcmlzbWEucHJpc21hID0gcHJpc21hO1xuIl0sIm5hbWVzIjpbIlByaXNtYUNsaWVudCIsImdsb2JhbEZvclByaXNtYSIsImdsb2JhbFRoaXMiLCJwcmlzbWEiLCJwcm9jZXNzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next@14.2.31_@babel+core@7.29.7_react-dom@18.3.1_react@18.3.1__react@18.3.1","vendor-chunks/@auth+core@0.37.2","vendor-chunks/next-auth@5.0.0-beta.25_next@14.2.31_@babel+core@7.29.7_react-dom@18.3.1_react@18.3.1__react@18.3.1__react@18.3.1","vendor-chunks/jose@5.10.0","vendor-chunks/@panva+hkdf@1.2.1","vendor-chunks/preact@10.11.3","vendor-chunks/bcryptjs@2.4.3","vendor-chunks/preact-render-to-string@5.2.3_preact@10.11.3","vendor-chunks/oauth4webapi@3.8.6","vendor-chunks/@auth+prisma-adapter@2.11.3_@prisma+client@5.22.0_prisma@5.22.0_","vendor-chunks/cookie@0.7.1"], () => (__webpack_exec__("(rsc)/./node_modules/.pnpm/next@14.2.31_@babel+core@7.29.7_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2Fworkspaces%2FPigeon-lab%2Felab%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fworkspaces%2FPigeon-lab%2Felab&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();