<template>
    <form @submit.prevent autocomplete="off" ref="searchForm" :class="{ 'disabled': isLoading }">
        <div id="searchBar_container">
            <div
                class="expander"
                @click.prevent="expanderClicked"
                :class="{ 'active': isExpanded }"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 0 24 24"
                    width="24px"
                    v-if="searchResultOpts === 'text'"
                >
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path
                        d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM10 5.47l4 1.4v11.66l-4-1.4V5.47zm-5 .99l3-1.01v11.7l-3 1.16V6.46zm14 11.08l-3 1.01V6.86l3-1.16v11.84z"
                    />
                </svg>

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 0 24 24"
                    width="24px"
                    v-else-if="searchAreaOpts === 'global'"
                >
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                    />
                </svg>

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 0 24 24"
                    width="24px"
                    v-else-if="searchAreaOpts === 'near'"
                >
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z" />
                </svg>
                <img
                    src="/assets/images/canada.png"
                    alt="canada"
                    width="22"
                    height="22"
                    class="absolute-center"
                    v-else-if="searchAreaOpts === 'ca'"
                />
            </div>
            <div class="input-container">
                <input
                    id="searchBar_search"
                    type="text"
                    placeholder="Search"
                    name="search"
                    :value="searchText"
                    @input="updateSearchText"
                    ref="searchInput"
                />
                <div class="clearBtnContainer" v-show="searchText" @click="earseSearchText">
                    <svg
                        class="clearInputBtn"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="#000000"
                    >
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path
                            d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"
                        />
                    </svg>
                </div>
            </div>

            <div class="searchBtn" @click="searchLocation">
                <svg class xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path
                        d="M15.5 14h-.79l-.28-.27c1.2-1.4 1.82-3.31 1.48-5.34-.47-2.78-2.79-5-5.59-5.34-4.23-.52-7.79 3.04-7.27 7.27.34 2.8 2.56 5.12 5.34 5.59 2.03.34 3.94-.28 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                    />
                </svg>
            </div>
        </div>
        <div class="expander-panel" v-show="isExpanded">
            <h1>Searching result</h1>
            <el-radio-group v-model="searchResultOpts" @change="resultOptsChanged">
                <el-radio :label="'text'">Text (may return multiple results)</el-radio>
                <el-radio :label="'autocomplete'">Autocomplete (only return one result)</el-radio>
            </el-radio-group>
            <div v-show="searchResultOpts === 'autocomplete'">
                <hr class="my-3" />
                <h1>Searching area</h1>
                <el-radio-group v-model="searchAreaOpts" @change="areaOptsChanged">
                    <el-radio :label="'global'">Global</el-radio>
                    <el-radio :label="'near'" :disabled="!myLocation">
                        Near your location ~20km
                        <span class="text-red-700" v-show="!myLocation">*</span>
                    </el-radio>
                    <el-radio :label="'ca'">Region: Toronto, Canada</el-radio>
                </el-radio-group>
                <div class="text-sm mt-2" style="color: #a8abb2" v-show="!myLocation">
                    <span class="text-red-700">*</span> Click on the My Location button first
                </div>
            </div>

            <div
                class="mt-4 cursor-pointer px-3 py-1 rounded bg-slate-100 max-w-fit ml-auto text-slate-500 hover:text-slate-800"
                @click="doneBtnClicked"
            >Done</div>
        </div>
    </form>
</template> 

 <script setup lang='ts'>
import { ElRadioGroup, ElRadio } from "element-plus/dist/index.full.js"
import type { PropType } from 'vue'
//  Variables
//  const searchText = ref("")
const searchInput = ref(null)
const searchResultOpts = ref<'text' | 'autocomplete'>("text")
const searchAreaOpts = ref<'global' | 'near' | 'ca'>('ca')
const searchForm = ref(null)
const isExpanded = ref(false)

const props = defineProps({
    myLocation: {
        type: Object as PropType<GeolocationPosition>,
        default: null
    },
    isLoading: {
        type: Boolean,
        default: false
    },
    searchText: {
        type: String,
        default: ""
    }
})

const emit = defineEmits(['onSearchOptsChanged', 'onSearchResultOptsChanged', 'onSearchEntered', 'onInputChanged']);
const resultOptsChanged = (value: string) => emit('onSearchResultOptsChanged', value)

const areaOptsChanged = (value) => {
    let searchopts = null
    if (value === 2) {
        searchopts = 'near'
    } else if (value === 3) {
        searchopts = 'ca'
    }
    return emit('onSearchOptsChanged', searchopts)
}

const doneBtnClicked = () => {
    isExpanded.value = false
    searchInput.value.focus()
}

watch(isExpanded, (newValue) => {
    newValue ? document.documentElement.classList.add('masked') : document.documentElement.classList.remove('masked')
})

const updateSearchText = (e) => emit('onInputChanged', e.target.value)

const earseSearchText = (e) => {
    emit('onInputChanged', "")
    searchInput.value.focus()
}
const searchLocation = () => emit('onSearchEntered', props.searchText)
const expanderClicked = () => isExpanded.value = !isExpanded.value

// create Click away listeners in onCreated()
useClickAway(searchForm, () => isExpanded.value = false)

</script> 
 <style lang='scss' scoped>
.cls-1 {
    fill: red;
}
.cls-2 {
    fill: #fff;
}
form {
    &.disabled {
        @apply pointer-events-none opacity-50;
    }
    @apply h-full w-full relative;
    .expander-panel {
        @apply w-full rounded shadow z-10 px-5 py-3  bg-white relative;
        animation-duration: 1s;
        animation-name: slidein;
    }
    #searchBar_container {
        @apply flex border border-slate-300 rounded items-center bg-slate-50 h-full;
        .expander {
            @apply w-7 h-7 mx-2 relative rounded-full cursor-pointer;

            svg {
                @apply absolute-center fill-slate-600;
            }
            &:hover {
                @apply bg-slate-200;
            }
        }
        .expander.active {
            @apply bg-slate-200;
        }
        .input-container {
            @apply flex flex-1 justify-between items-center relative;

            input {
                @apply flex-1  py-1 pr-8;
            }

            .clearBtnContainer {
                @apply rounded-xl cursor-pointer mx-2  w-4 h-4 absolute;
                right: 0;
                padding: 1px;
            }
            .clearBtnContainer:hover {
                @apply bg-slate-400;
                .clearInputBtn {
                    @apply fill-white;
                }
            }
        }

        .searchBtn {
            @apply w-6 h-full px-6 cursor-pointer min-w-max  bg-slate-200 relative border;
            border-top-right-radius: 0.25rem;
            border-bottom-right-radius: 0.25rem;
            svg {
                @apply absolute-center w-6 h-6 inline-block fill-slate-600;
            }
        }
    }
    #searchBar_container.active {
        box-shadow: 0 0 10px #719ece;
    }
}

@keyframes slidein {
    from {
        margin-bottom: 100%;
    }

    to {
        margin-bottom: 0%;
    }
}
</style>

<style >
.pac-container {
    padding-bottom: 10px;
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
}
.pac-item {
    @apply cursor-pointer px-2;
}
.pac-item:hover {
    @apply bg-slate-300;
}
.pac-container:after {
    /* Disclaimer: not needed to show 'powered by Google' if also a Google Map is shown */

    background-image: none !important;
    height: 0px;
}
</style>