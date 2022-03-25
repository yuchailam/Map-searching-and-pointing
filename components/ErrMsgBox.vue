<template>
    <div class="errMsgBox-container" v-show="errMsg">
        <div class="errMsgBox-Msg">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 0 24 24"
                width="24px"
                fill="#FFFFFF"
            >
                <path
                    d="M12 7c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1s-1-.45-1-1V8c0-.55.45-1 1-1zm-.01-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm1-3h-2v-2h2v2z"
                />
            </svg>
            <span>{{ errMsg }}</span>
        </div>

        <div class="closebtn" @click="closeMsgBox">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path
                    d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"
                />
            </svg>
        </div>
    </div>
</template> 

 <script setup lang='ts'>
 import { defineAsyncComponent, onMounted } from 'vue'
 
 const emit = defineEmits(['onCloseClicked']);
 const props = defineProps({
     errMsg: {
         type: String,
         default: ""
     },
 })
 
 const closeMsgBox = () => emit('onCloseClicked')
 
 </script> 
 <style lang='scss' scoped>
.errMsgBox-container {
    @apply border border-red-700  bg-red-400/80 px-6 py-3 rounded-md relative flex justify-between items-center;
    svg {
        @apply inline-block mr-3 fill-red-900;
    }
    span {
        @apply align-middle;
    }

    .closebtn {
        @apply rounded-xl cursor-pointer mx-2 w-6 h-6 relative;

        svg {
            @apply absolute absolute-center fill-slate-900 w-5 h-5;
        }
    }
    .closebtn:hover {
        @apply bg-slate-400;
        svg {
            @apply fill-white;
        }
    }
}
</style>