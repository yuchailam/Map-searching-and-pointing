# Map Search API

## Task Requirement

Complete a small task as below using or Vue:

Create a web page includes:

1. A button to support user location acquisition from browser.
2. A module which allows user to input the name of a location. (Searching feature is triggered by both button click, and press enter key on the keyboard)
3. Display the location on the map and add a marker to each searched location every time when the location is changed.
4. A table with pagination to show all searched places:
   1. It displays a maximum of 10 records on each page.
   2. A checkbox at the beginning of each row to allow user to select multiple records at the same time.
   3. A delete button on the top of it to delete all selected records as well as the marker on the map.
5. Display the time zone and local time of the latest searched location.

## Libraries

| Frameworks | Google Maps library | UI library   |
| ---------- | ------------------- | ------------ |
| Nuxt       | Map                 | Element Plus |
| Vue 3      | Autocomplete        | Tailwind CSS |
| SCSS       | Search Box          |
| Typescript | Time Zone           |
| infoWindow |

## Setup

- Add your Google GeoAPIKey to `nuxt.config.ts` file, under publicRuntimeConfig > GeoAPIKey

- Make sure to install the dependencies

```bash
yarn install
```

## Development

- Start the development server on http://localhost:3000

```bash
yarn dev
```

## Production

- Build the application for production:

```bash
yarn build
```

## Run on Production

```bash
yarn start
```

## Results