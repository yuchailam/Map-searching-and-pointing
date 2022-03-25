<template>
    <div class="flex relative w-full h-full" id="content">
        <!-- A button to support user location acquisition from browser. -->
        <!-- ToDo animation / styling -->
        <div class="flex-1 p-5">
            <ErrMsgBox :errMsg="errMsg" @onCloseClicked="onErrCloseClicked"></ErrMsgBox>
            <section>
                <ul id="mapOpts" class="flex justify-center space-x-6 items-center h-9">
                    <li>
                        <MyLocationBtn
                            btnText="My location"
                            :isDisabled="isLoading"
                            @onClicked="locationClicked"
                        ></MyLocationBtn>
                    </li>
                    <li class="flex-1 z-10">
                        <LocationSearch
                            :myLocation="myLocation"
                            :isLoading="isFetching"
                            :searchText="searchInputText"
                            @onInputChanged="value => searchInputText = value"
                            @onSearchResultOptsChanged="changeSearchResultOpts"
                            @onSearchEntered="searchText"
                            @onSearchOptsChanged="changeSearchAreaOpts"
                        ></LocationSearch>
                    </li>
                </ul>
            </section>
            <hr />
            <!-- Table -->
            <!-- <div class="h-96"></div> -->
            <section>
                <MapsTable></MapsTable>
            </section>
        </div>
        <div class="flex-1 z-10">
            <div class="map-container">
                <div class="loading" v-show="isLoading || isFetching">
                    <div class="loader"></div>
                </div>
                <div id="map"></div>
            </div>

            <!-- <Maps :isLoading="isLoading" :myLocation="myLoaction"></Maps> -->
            <!-- ToDo add loading due to sometime the browser takes longer time to render the location-->
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive } from "vue"
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { ElMessage } from "element-plus/dist/index.full.js"
import { Loader } from '@googlemaps/js-api-loader';

const MyLocationBtn = defineAsyncComponent(() => import("~~/components/MyLocationBtn.vue"))
const LocationSearch = defineAsyncComponent(() => import("~~/components/LocationSearch.vue"))
const MapsTable = defineAsyncComponent(() => import("~~/components/MapsTable.vue"))
const ErrMsgBox = defineAsyncComponent(() => import("~~/components/ErrMsgBox.vue"))

// Ref Variables
let myLocation = ref<GeolocationPosition | null>(null)
let errMsg = ref("")
const searchInputText = ref("")

let isLoading = ref<boolean>(false)  // My Location Btn and Maps show loadng and are disabled
let isFetching = ref<boolean>(false) // show loading on Map and disable input when fetching data
//  Variables
const { records } = useSearchTable()
let mapMarkers: google.maps.Marker[] = []
let mapElement: HTMLElement
let searchInputElement: HTMLInputElement
// APIs
let map: google.maps.Map;
let markerClusterer: MarkerClusterer;
let infoWindow: google.maps.InfoWindow; // infoWindow = popper window
let searchBox: google.maps.places.SearchBox
let autocomplete: google.maps.places.Autocomplete;
let autocompleteListener: google.maps.MapsEventListener;
let autoCompleteOpts: google.maps.places.AutocompleteOptions | null = { componentRestrictions: { country: "ca" } }

let textService: google.maps.places.PlacesService
let textServiceOtps: google.maps.places.TextSearchRequest = {
    query: ""
}; // cannot be null

// Settings
const mapOptions = {
    center: { lat: 43.833037064979415, lng: -79.31268856536445 },
    zoom: 6, //  Zoom level 1: World || 5: Landmass/continent ||  10: City || 15: Streets || 20: Buildings
};
// ----- End of Map default settings

const locationClicked = () => {
    isLoading.value = true
    const getGeolocation = new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            // onSucceed Properties => https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition
            // onError Properties => https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError
            navigator.geolocation.getCurrentPosition((pos) => resolve(pos), (err) => reject(err.message.toString()));
        } else {
            reject('Location acquisition is not supported by this browser.')
        }
    })
    getGeolocation
        .then((pos: GeolocationPosition) => myLocation.value = pos)
        .catch((err) => errMsg.value = err)
        .finally(() => isLoading.value = false)
}

const onErrCloseClicked = () => errMsg.value = ""

// ---------------------------------------------------------------- Search settings

const changeSearchAreaOpts = (setting?: String) => {
    if (setting === "near") {
        if (myLocation.value && myLocation.value.coords.latitude && myLocation.value.coords.longitude) {
            autoCompleteOpts = {
                bounds: {
                    // Create a bounding box with sides ~20km away from the center point
                    north: myLocation.value.coords.latitude + 0.2,
                    south: myLocation.value.coords.latitude + 0.2,
                    east: myLocation.value.coords.longitude + 0.2,
                    west: myLocation.value.coords.longitude + 0.2,
                }
            }
        }
    } else if (setting === "ca") {
        autoCompleteOpts = { componentRestrictions: { country: "ca" } }
    } else {
        autoCompleteOpts = null
    }
    setMapAutoComplete(autoCompleteOpts)
}

const changeSearchResultOpts = (setting: string) => {
    if (setting === "text") {
        if (autocomplete) google.maps.event.clearInstanceListeners(autocomplete);
        if (autocompleteListener) google.maps.event.removeListener(autocompleteListener);
        setSearchBox()
    } else if (setting === "autocomplete") {
        if (searchBox) google.maps.event.clearInstanceListeners(searchBox);
        setMapAutoComplete(autoCompleteOpts)
    }
}
// ---------------------------------------------------------------- End of Search settings

// ---------------------------------------------------------------- Maps 

// Enf of Variables
watch(records, (newRecord: RecordsUpdate) => {
    //  Have to redraw all markers due to MarkerClusterer provide index on zoomed-out map
    if (newRecord.action === 'add') {
        addMarker(newRecord.tableRows)
    } else if (newRecord.action === 'remove') {
        removeMarker(newRecord.tableRows, newRecord.changeIndex)
    } else {
        return;
    }
})

const addMyLocation = (pos: LocationPoint) => new google.maps.Marker({
    position: pos,
    map: map,
    icon: '/assets/images/myLocation.png'
});

const removeMarker = (records: SearchProps[], startIndex: number) => {
    //  remove old markers from startIndex
    let removeMarkers = mapMarkers.slice(startIndex, mapMarkers.length)
    markerClusterer.removeMarkers(removeMarkers)
    addMarker(records)
}

const addMarker = (records: SearchProps[]) => {
    const markers = records.map((record, i) => {
        //  if no position , don't display it on map
        if (!record.lat || !record.lng) return;

        const label = record.index.toString();
        const position: LocationPoint = { lat: record.lat, lng: record.lng }
        const marker = new google.maps.Marker({
            position,
            label
        });
        // markers can only be keyboard focusable when they have click listeners
        // open info window when marker is clicked
        marker.addListener("click", () => {
            infoWindow.setContent(makeMarkerContent(record));
            infoWindow.open(map, marker);
        });
        return marker;
    });
    mapMarkers.push(...markers)
    // Add a marker clusterer to manage the markers.
    markerClusterer.addMarkers(markers);
}

const makeMarkerContent = (record: SearchProps) =>
    `  <div class='info-container' >
        <h1 class="title"> ${record.address || record.fullAddress} </h1>
        <p>
            <b>Postcode:</b> ${record.postcode || 'N/A'}
        </p>
        <p><b>Time Zone:</b> ${record.timeZone || ''}</p>
        <p><b>Local Time:</b> ${record.localTime || ''}</p>
    </div>
    `

onUpdated(() => {
    if (myLocation.value) {
        let pos = {
            lat: myLocation.value.coords.latitude,
            lng: myLocation.value.coords.longitude
        }
        addMyLocation(pos)
        map.setZoom(10)
    }
})

// ---------------------------------------------------------------- End of Maps  

const setSearchBox = () => {
    searchBox = new google.maps.places.SearchBox(searchInputElement);
    searchBox.bindTo("bounds", map);
    searchBox.addListener('places_changed', async () => {
        searchInputText.value = searchInputElement.value
        isFetching.value = true
        let jobs = searchBox.getPlaces().map((place) => addRowToTable(place))
        await Promise.all(jobs)
        isFetching.value = false
    })
}
// ----------------------------------------------------------------  Maps AutoComplete 
const setMapAutoComplete = (opts) => {
    autocomplete = new google.maps.places.Autocomplete(searchInputElement, opts)
    autocompleteListener = autocomplete.addListener('place_changed', () => {
        searchInputText.value = searchInputElement.value
        addRowToTable(autocomplete.getPlace())
    })
    return;
}
// ---------------------------------------------------------------- End of Maps AutoComplete 

const addRowToTable = (place: google.maps.places.PlaceResult) =>
    useSearchTable().addRow(place).then((index) => {
        ElMessage({
            showClose: true,
            message: `New location has been added to table with index: #${index} `,
            type: 'success',
        })
    }).catch((err) => {
        console.log(err);
        ElMessage({
            showClose: true,
            message: 'Oops, Cannot get the place. ',
            type: 'error'
        })
    })

// ---------------------------------------------------------------- Maps TextService 

const searchText = (input: string) => {
    if (input) {
        isFetching.value = true
        textServiceOtps.query = input
        textService.textSearch(textServiceOtps, async (results: google.maps.places.PlaceResult[] | null, status) => {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                let jobs = results.map(item => addRowToTable(item))
                await Promise.all(jobs)
            }
            isFetching.value = false
        });
    }
}
// ---------------------------------------------------------------- End of Maps TextService 
const initMap = () => {
    map = new google.maps.Map(mapElement, mapOptions);
    infoWindow = new google.maps.InfoWindow();
    markerClusterer = new MarkerClusterer({ markers: [], map });
    textService = new google.maps.places.PlacesService(map);
    setSearchBox()
}

const useMapLoader = (): Promise<typeof google> =>
    new Loader({
        apiKey: useRuntimeConfig().GeoAPIKey,
        version: 'weekly',
        libraries: ['places'],
    }).load();


onMounted(() => {
    mapElement = document.getElementById('map') as HTMLElement
    searchInputElement = document.getElementById("searchBar_search") as HTMLInputElement
    isLoading.value = true
    useMapLoader().then(() => initMap()).finally(() => isLoading.value = false)
})

</script>

<style lang="scss" scoped>
body {
    @apply w-screen h-screen;

    #mapOpts {
        li {
            @apply self-stretch;
        }
    }

    section {
        @apply my-4 overflow-visible;
    }
}
html.masked {
    #content::before {
        @apply bg-black/20;
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 5;
    }
}
</style>

<style lang='scss' scoped>
.map-container {
    @apply relative;
}
#map {
    height: 100vh;
    /* The height is 400 pixels */
    width: 100%;
    /* The width is the width of the web page */
}
.loading {
    @apply w-full h-full absolute bg-slate-50/80 z-50;
    .loader {
        @apply absolute-center;
        border: 12px solid #cbd5e1;
        border-radius: 50%;
        border-top: 12px solid #3498db;
        width: 120px;
        height: 120px;
        -webkit-animation: spin 2s linear infinite; /* Safari */
        animation: spin 2s linear infinite;
    }

    /* Safari */
    @-webkit-keyframes spin {
        0% {
            -webkit-transform: rotate(0deg);
        }
        100% {
            -webkit-transform: rotate(360deg);
        }
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
}
</style>