<template>

    <router-link :to="`/address/${finalAddress}`" :class="{ disabled: !finalAddress || disableRoute }" :alt="finalAddress">
        <div class="identicon outer" :style="`padding: ${outerSize}px`">
            <img :src="identiconSrc" class="identicon" :style="`width: ${size}px`" >
        </div>
    </router-link>

</template>

<script>

import Identicons from "src/utils/identicons"

export default {

    props:{
        size: {default: 40},
        outerSize: {default: 34},

        identicon: {default: null},
        address: {default: ""},
        publicKey: {default: null},
        publicKeyHash: {default: null},

        disableRoute: { default: false }
    },

    data(){
        return{
            identiconSrc: "",
            finalAddress: "",
        }
    },

    watch:{
        identicon: {
            immediate: true,
            handler: function(newVal, oldVal){
                this.identiconSrc = newVal
            }
        },
        publicKeyHash: {
            immediate: true,
            handler: async function(newVal, oldVal){
                if (newVal) {
                    this.identiconSrc = await Identicons.getIdenticon(newVal)
                    const out = await PandoraPay.addresses.generateAddress(newVal)
                    this.finalAddress = out[1]
                }
            }
        },
        publicKey: {
            immediate: true,
            handler: async function(newVal, oldVal){
                if (newVal){
                    const publicKeyHash = await PandoraPay.cryptography.computePublicKeyHash(newVal)
                    this.identiconSrc = await Identicons.getIdenticon(publicKeyHash)
                    const out = await PandoraPay.addresses.generateAddress(publicKeyHash)
                    this.finalAddress = out[1]
                }
            }
        },
        address: {
            immediate: true,
            handler: async function(newVal, oldVal){
                if (newVal) {
                    const addressData = await PandoraPay.addresses.decodeAddress(newVal)
                    const address = JSON.parse(addressData)
                    this.identiconSrc = await Identicons.getIdenticon(address.publicKeyHash)
                    this.finalAddress = newVal
                }
            }
        }
    },

    computed:{
    }


}
</script>

<style scoped>


    .outer{
        display: inline-table;
        -webkit-border-radius: 50%;
        -moz-border-radius: 50%;
        -khtml-border-radius: 50%;
        border-radius: 50%;
        overflow: hidden;
        padding: 10px;
    }

    .identicon{
        background-color: white;
    }

    .dark .identicon{
        background-color: black;
    }

</style>
