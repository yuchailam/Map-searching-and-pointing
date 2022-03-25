import { defineNuxtConfig } from 'nuxt3';

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  // meta
  meta: {
    title: 'Maps checking api',
    meta: [
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: "Aaron Yu's map checking",
      },
    ],
    link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
  },
  privateRuntimeConfig: {},
  publicRuntimeConfig: {
    //$config
    // https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY
    Geocode_URL: 'https://maps.googleapis.com/maps/api/geocode/json',
    GeoLibrary_URL: 'https://maps.googleapis.com/maps/api/js?',
    GeoAPIKey: '',
  },
  components: true,
  ssr: false,
  vite: {
    ssr: {
      noExternal: ['@googlemaps/js-api-loader', '@googlemaps/markerclusterer', 'element-plus/dist/index.full.js'],
    },
    css: {
      preprocessorOptions: {
        scss: {},
      },
    },
  },
  build: {
    postcss: {
      postcssOptions: {
        plugins: {
          'postcss-import': {},
          tailwindcss: {},
          autoprefixer: {},
        },
      },
    },
  },
  css: ['~/assets/css/tailwind.scss'],
});
