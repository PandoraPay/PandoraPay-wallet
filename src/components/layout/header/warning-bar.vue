<template>
    <div>
        <div class="warning" v-if="shown">
            You are connecting to the <strong>{{$store.state.network.networkPrefix}}</strong>. Don't use your Mainnet accounts in the Testnet!
            <i class="fa fa-times" @click="hide"></i>
        </div>
    </div>
</template>

<script>
export default {

    data(){
        return {
            shown: true,
        }
    },

    methods:{

        hide(){
            this.shown = false;
        },

    },

    computed:{

    }

}
</script>

<style scoped>

    .warning{
        padding: 10px;
        color: #3b3b3b;
        text-align: center;
        background-color: #eaaa16;
    }

    .warning i{
        float: right;
        cursor: pointer;
    }

</style>
