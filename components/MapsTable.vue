<template>
    <div class="mapsTable-container">
        <div class="mapsTable-header">
            <div class="title">Search Table</div>
            <div class="deleteBtn" :class="{ 'active': numOfSeletedItem }" @click="removeRecord">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path
                        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v10zM9 9h6c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1v-8c0-.55.45-1 1-1zm6.5-5l-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1h-2.5z"
                    />
                </svg>
                <span>Delete&nbsp;</span>
                <span v-show="numOfSeletedItem">({{ numOfSeletedItem }})</span>
            </div>
        </div>
        <div class="mapsTable-table">
            <el-table
                ref="searchTable"
                :data="tableRows"
                style="width: 100%"
                @selection-change="handleSelectionChange"
                :row-key="(row) => row.index"
                :expand-row-keys="expandLastRow()"
            >
                <el-table-column fixed type="selection" width="55" />
                <el-table-column fixed label="#" width="60">
                    <template #default="scope">{{ scope.row.index }}</template>
                </el-table-column>
                <el-table-column property="fullAddress" label="Address" show-overflow-tooltip />
                <el-table-column type="expand">
                    <template #default="props">
                        <div class="loctionInfo px-10">
                            <div class="header section">
                                <span class="title">
                                    Location Info:
                                    <span
                                        style="font-weight: normal"
                                    >( Search date: {{ props.row.searchDate }} )</span>
                                </span>
                            </div>
                            <div class="time section">
                                <div>
                                    <span class="title">Time Zone:</span>
                                    <div
                                        class="infoBox"
                                        v-if="props.row.timeZone"
                                    >{{ props.row.timeZone }}</div>
                                    <div v-else class="infoBox noValue">N/A</div>
                                </div>
                                <div>
                                    <span class="title">Local Zone:</span>
                                    <div
                                        class="infoBox"
                                        v-if="props.row.localTime"
                                    >{{ props.row.localTime }}</div>
                                    <div v-else class="infoBox noValue">N/A</div>
                                </div>
                            </div>
                            <div class="location section">
                                <div>
                                    <span class="title">Position:</span>
                                    <div
                                        class="infoBox"
                                        v-if="props.row.lat || props.row.lng"
                                    >{{ props.row.lat }} , {{ props.row.lng }}</div>
                                    <div v-else class="infoBox noValue">N/A</div>
                                </div>
                                <div>
                                    <span class="title">Address:</span>
                                    <div
                                        class="infoBox"
                                        v-if="props.row.address"
                                    >{{ props.row.address }}</div>
                                    <div v-else class="infoBox noValue">N/A</div>
                                </div>
                                <div>
                                    <span class="title">Locality:</span>
                                    <div
                                        class="infoBox"
                                        v-if="props.row.locality"
                                    >{{ props.row.locality }}</div>
                                    <div v-else class="infoBox noValue">N/A</div>
                                </div>
                                <div>
                                    <span class="title">State:</span>
                                    <div
                                        class="infoBox"
                                        v-if="props.row.state"
                                    >{{ props.row.state }}</div>
                                    <div v-else class="infoBox noValue">N/A</div>
                                </div>
                                <div>
                                    <span class="title">Country:</span>
                                    <div
                                        class="infoBox"
                                        v-if="props.row.country"
                                    >{{ props.row.country }}</div>
                                    <div v-else class="infoBox noValue">N/A</div>
                                </div>

                                <div>
                                    <span class="title">Postcode:</span>
                                    <div
                                        class="infoBox"
                                        v-if="props.row.postcode"
                                    >{{ props.row.postcode }}</div>
                                    <div v-else class="infoBox noValue">N/A</div>
                                </div>
                            </div>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="pageInfo">
            Page:
            <span
                v-if="tableData.totalPages"
            >{{ tableData.currentPage }}/{{ tableData.totalPages }}</span>
            <span v-else>- / -</span>
        </div>
        <div class="mapsTable-pagination">
            <ul>
                <li
                    class="leftArrow arrow"
                    :class="tableData.currentPage <= 1 ? 'disabled' : ''"
                    @click="leftArrowClicked"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path
                            d="M14.71 6.71c-.39-.39-1.02-.39-1.41 0L8.71 11.3c-.39.39-.39 1.02 0 1.41l4.59 4.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L10.83 12l3.88-3.88c.39-.39.38-1.03 0-1.41z"
                        />
                    </svg>
                </li>
                <li
                    class="pageNum"
                    v-for="(item) in tableData.pages.length"
                    :key="item"
                    @click="pageIndexOnclicked(item)"
                >
                    <span :class="tableData.currentPage === item ? 'active' : ''">{{ item }}</span>
                </li>
                <li
                    class="rightArrow arrow"
                    :class="tableData.currentPage === tableData.totalPages ? 'disabled' : ''"
                    @click="rightArrowClicked"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path
                            d="M9.31 6.71c-.39.39-.39 1.02 0 1.41L13.19 12l-3.88 3.88c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l4.59-4.59c.39-.39.39-1.02 0-1.41L10.72 6.7c-.38-.38-1.02-.38-1.41.01z"
                        />
                    </svg>
                </li>
            </ul>
        </div>
    </div>
</template> 

 <script setup lang='ts'>
import { computed } from 'vue'
import { ElTable, ElTableColumn } from "element-plus/dist/index.full.js";
import { useSearchTable } from '../composables/useSearchTable';

const multipleSelection = ref<SearchProps[]>([])
const numOfSeletedItem = computed(() => multipleSelection.value.length)
const tableRows = computed(() =>
    tableData.value.searchProps.slice(tableData.value.startIndex, tableData.value.endIndex + 1)
)

const {
    tableData,
    removeRow,
    currentPage,
    setPage
} = useSearchTable()

const searchTable = ref()
const handleSelectionChange = (val) => {
    console.log(val);

    multipleSelection.value = val
}
//  multipleTableRef.value!.toggleRowSelection(row, undefined)
const removeRecord = () => removeRow(multipleSelection.value.map((item) => item.index))

const pageIndexOnclicked = (index: number) => setPage(index)
const rightArrowClicked = () => setPage(currentPage.value + 1)
const leftArrowClicked = () => setPage(currentPage.value - 1)
const expandLastRow = () => tableRows.value.length ? [tableRows.value[length - 1].index] : []

</script> 
 <style lang='scss' scoped>
.mapsTable-container {
    .mapsTable-header {
        @apply flex justify-between items-center;
        .title {
            @apply font-title text-slate-800/80 text-2xl;
        }
        .deleteBtn {
            @apply bg-slate-200 rounded-md w-max px-3 py-1 text-slate-600/80 pointer-events-none;
            svg {
                @apply inline-block w-6 h-6 mr-2;
            }
            span {
                @apply align-middle;
            }
        }
        .deleteBtn.active {
            @apply bg-red-700 text-slate-50 cursor-pointer pointer-events-auto;
        }
        .deleteBtn.active:hover {
            @apply bg-red-800 shadow;
        }
    }
    .mapsTable-table {
        @apply my-2;
    }
    .pageInfo {
        @apply py-5 text-slate-600 w-full text-center;
    }
    .mapsTable-pagination {
        ul {
            @apply flex space-x-2 justify-center my-2;
            li {
                @apply w-8 h-8 rounded bg-blue-200/80 relative cursor-pointer;
                span {
                    @apply absolute-center text-lg text-slate-600/80;

                    &.active {
                        @apply text-slate-700 text-xl;
                    }
                }
            }
            li:hover {
                @apply shadow;
            }
            li.arrow.disabled {
                @apply bg-slate-200/80 text-slate-400 pointer-events-none;
            }
            .arrow {
            }
        }
    }
}

.loctionInfo {
    .section {
        @apply space-x-4;
        display: flex;
        align-items: center;
        padding: 5px 0px;
        .title {
            font-weight: bold;
        }
        .infoBox {
            margin: 2px 0;
            border: 1px solid #cbd5e1;
            padding: 3px 8px;
            border-radius: 4px;
            text-align: center;
            background-color: #f1f5f9;
        }
        .infoBox.noValue {
            opacity: 0.5;
        }
    }
}
</style>