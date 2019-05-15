module.exports = {
  "globDirectory": "images/",
  "globPatterns": [
    "**/*.png"
  ],
  "swDest": "service-worker.js",
   "runtimeCaching": [{
       "urlPattern": "/.(?:jpg|jpeg)$/",
       "handler": "CacheFirst",
   }],
   "importWorkboxFrom": "local",
   "globIgnores": [
       'node_modules/**/*',
       'workbox-config.js',
       'workbox-v4.2.0'
   ]
};