<template>

    <div>

        <alert-box v-if="error" type="error">{{error}}</alert-box>
        <template v-else>
            <div class="d-flex flex-center" v-if="!walletInitialized" style="height: 100vh;" >
                <loading-spinner class="fs-5"/>
            </div>
            <router-view v-else></router-view>
        </template>

    </div>

</template>

<script>

import AlertBox from "src/components/utils/alert-box"
import consts from "consts/consts"
import LoadingSpinner from "src/components/utils/loading-spinner";

export default {

    components: {  AlertBox, LoadingSpinner },

    data(){
        return {
            error: '',
            walletInitialized: false,
        }
    },

    computed:{
    },

    beforeMount(){
        this.$store.commit('createSyncPromise')
    },

    async mounted(){

        if (typeof window === "undefined") return;

        if (typeof localStorage !== "undefined" && localStorage.getItem('dark') === 'true')
            this.$store.commit('setDark', true)

        setTimeout( ()=> this.clearUnusedDataStoreWorker(), 1000)

        this.$store.commit('setNetworkByte', {
            networkByte: PandoraPay.config.NETWORK_SELECTED,
            networkPrefix: PandoraPay.config.NETWORK_SELECTED_NAME,
            networkName: PandoraPay.config.NETWORK_SELECTED_NAME,
        })

        let initialized = false
        PandoraPay.events.listenEvents( (name, data )=>{

            if (name === "main")
                if (data === "initialized"){
                    initialized = true

                    PandoraPay.events.listenNetworkNotifications(( subscriptionType, key, data, extraInfo)=>{

                        console.log("listenNetworkNotifications", data, extraInfo)

                        if (subscriptionType === PandoraPay.enums.api.websockets.subscriptionType.SUBSCRIPTION_ACCOUNT)
                            return this.$store.commit('accountNotification', {publicKeyHash: key, account: JSON.parse(data) })

                        if (subscriptionType === PandoraPay.enums.api.websockets.subscriptionType.SUBSCRIPTION_ACCOUNT_TRANSACTIONS)
                            return this.$store.commit('accountTxUpdateNotification', { publicKeyHash: key, txHash:data.substr(1,64), extraInfo: JSON.parse(extraInfo) } )

                        if (subscriptionType === PandoraPay.enums.api.websockets.subscriptionType.SUBSCRIPTION_TRANSACTION)
                            return this.$store.commit('txNotification', { txHash: key, extraInfo: JSON.parse(extraInfo) } )
                    })

                    this.readWallet()
                }

            if (name === "sockets/totalSocketsChanged"){
                if (data > 0) {
                    this.$store.commit('setConsensusStatus', "online")
                    this.$store.dispatch('initializeFaucetInfo')
                }
                else this.$store.commit('setConsensusStatus', "offline")
            }

            if (initialized) {
                if (name === "wallet/added") this.readWallet()
                else if (name === "wallet/removed") this.readWallet()
                else if (name === "wallet/encrypted") this.readWallet()
                else if (name === "wallet/removed-encryption") this.readWallet()
                else if (name === "wallet/logged-out") this.readWallet()
                else if (name === "consensus/update")
                    this.processUpdate(JSON.parse(data))

            }
            console.log("JS NAME:", name, "data", data)
        })

        PandoraPay.helpers.start().then(()=>{

        })

    },

    methods:{

        async processUpdate(data){
            if (this.$store.state.blockchain.status === 'online')
                this.$store.commit('setConsensusStatus', "sync")

            this.$store.commit('setBlockchainInfo', data)
            await this.$store.dispatch('getBlocksInfo',  {starting: this.$store.state.blockchain.end - consts.blocksInfoPagination, blockchainEnd: this.$store.state.blockchain.end } )

            for (const key in this.$store.state.wallet.addresses)
                await this.$store.dispatch('subscribeAccount', this.$store.state.wallet.addresses[key].publicKeyHash)
        },


        async readWallet(){

            this.walletInitialized = true

            await this.$store.dispatch('readWallet')

            const loaded = this.$store.state.wallet.loaded

            const route = this.$router.currentRoute.path;
            if (!loaded && route.indexOf('/login') === -1 ){

                //TODO allow some functionalities even if the wallet was not
                //if ( route.indexOf('/explorer') === -1 && route.indexOf('/tokens') === -1)

                this.$router.push('/login');
            }
            if (loaded && route.indexOf('/login') >= 0) this.$router.push('/');

        },

        clearUnusedDataStoreWorker(){

            const timestamp = new Date().getTime()
            const maxDiff = 5*60*1000

            try{
                const blocksRemoved = [], txsRemoved = []

                const blocksByHash = this.$store.state.blocks.blocksByHash
                for (const hash in blocksByHash){
                    const blk = blocksByHash[hash]
                    if (blk.bloom.hash !== this.$store.state.blocks.viewBlockHash && timestamp - blk.__timestampUsed > maxDiff)
                        blocksRemoved.push(blk)
                }

                const blocksByHeight = this.$store.state.blocks.blocksByHeight
                for (const height in blocksByHeight){
                    const blk = blocksByHeight[height]
                    if (blk.bloom.hash !== this.$store.state.blocks.viewBlockHash && timestamp - blk.__timestampUsed > maxDiff)
                        blocksRemoved.push(blk)
                }

                const txsByHash = this.$store.state.transactions.txsByHash
                for (const hash in txsByHash){
                    const tx = txsByHash[hash]
                    if (!this.$store.state.transactions.viewTxsHashes[tx.bloom.hash] && timestamp - tx.__timestampUsed > maxDiff)
                        txsRemoved.push(tx)
                }

                const txsByHeight = this.$store.state.transactions.txsByHeight
                for (const height in txsByHeight){
                    const tx = txsByHeight[height]
                    if (!this.$store.state.transactions.viewTxsHashes[tx.bloom.hash] && timestamp - tx.__timestampUsed > maxDiff)
                        txsRemoved.push(tx)
                }

                if (txsRemoved.length)
                    this.$store.commit('deleteTransactions', txsRemoved )

                if (blocksRemoved.length)
                    this.$store.commit('deleteBlocks', blocksRemoved )

            }catch(err){
                console.error("clearUnusedDataStoreWorker raised an error", err)
            }

            setTimeout( () => this.clearUnusedDataStoreWorker(), 1000)

        }

    },

}
</script>


<style scoped>

</style>
