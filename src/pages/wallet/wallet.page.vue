<template>

    <layout>

        <layout-title icon="fa-wallet" title="Wallet" >Access the private key of the selected address.</layout-title>

        <template v-if="address">

            <account :address="address" />

            <div class="card mb-3">
                <div class="card-header bg-light">
                    <div class="row align-items-center">
                        <div class="col">
                            <h5 class="mb-0">Account Additional Details</h5>
                        </div>
                    </div>
                </div>
                <div class="card-body border-bottom border-200">

                    <div class="row py-2">
                        <div v-if="!showPublicKey" class="pointer w-auto" @click="showPublicKey = true">
                            View Public Key
                        </div>
                        <div v-else>
                            Public Key: {{address.publicKey}}
                            <i class="fa fa-copy pointer d-inline-block" v-tooltip.bottom="'Copy Public Key'"  @click="handleCopyAddress(address.publicKey)" />
                        </div>
                    </div>

                    <div class="row py-2">
                        <div v-if="!showPublicKeyHash" class="pointer w-auto" @click="showPublicKeyHash = true">
                            View Public Key Hash
                        </div>
                        <div v-else >
                            Public Key Hash: {{address.publicKeyHash}}
                            <i class="fa fa-copy pointer d-inline-block" v-tooltip.bottom="'Copy Public Key Hash'" @click="handleCopyAddress(address.publicKeyHash)" />
                        </div>
                    </div>

                </div>

                <div class="card-body bg-light">

                    <button class="btn btn-falcon-default rounded-pill me-1 mb-1" type="button" @click="handleDownloadAddress" v-tooltip.bottom="'Download Account'" >
                        <i class="fa fa-download"></i>
                    </button>

                    <button class="btn btn-falcon-default rounded-pill me-1 mb-1" type="button" @click="handleDeleteAddress" v-tooltip.bottom="'Delete Account'" >
                        <i class="danger fa fa-times"></i>
                    </button>

                    <button class="btn btn-falcon-default rounded-pill me-1 mb-1" type="button" @click="handleShowPrivateKey" v-tooltip.bottom="'View Private Key'" >
                        <i class="fa fa-eye"></i>
                    </button>

                    <router-link to="/staking" v-if="address.version === version.VERSION_TRANSPARENT">
                        <button class="btn btn-falcon-default rounded-pill me-1 mb-1" type="button" v-tooltip.bottom="'Delegate stake'">
                            <i class="fa fa-piggy-bank"></i>
                        </button>
                    </router-link>

                </div>
            </div>

        </template>

        <account-private-key-modal ref="refAccountPrivateKeyModal" :address="address"/>
        <account-delete-modal ref="refAccountDeleteModal" :address="address"/>

    </layout>

</template>

<script>

import AccountIdenticon from "src/components/wallet/account/account-identicon";
import FileSaver from 'file-saver'
import consts from 'consts/consts';
import AccountPrivateKeyModal from "src/components/wallet/account/account-private-key.modal"
import Layout from "src/components/layout/layout"
import LayoutTitle from "src/components/layout/layout-title";
import Account from "src/components/wallet/account/account"
import AccountDeleteModal from "src/components/wallet/account/account-delete.modal"
const {version} = PandoraPay.enums.wallet.address;

export default {

    components: {AccountIdenticon, AccountPrivateKeyModal, Layout, Account, LayoutTitle, AccountDeleteModal},

    data(){
        return {
            showPublicKey: false,
            showPublicKeyHash: false,
        }
    },


    computed:{

        version: () => version,

        address(){
            return this.$store.state.wallet.addresses[this.$store.state.wallet.mainPublicKeyHash] ;
        }

    },


    methods:{

        async handleDownloadAddress(){

            if ( typeof Blob === "undefined")
                return this.$store.dispatch('addToast', {
                    type: 'error',
                    title: `Blob is not supported by your Browser`,
                    text: `Update your browser`,
                })

            const password = await this.$store.state.page.refWalletPasswordModal.showModal()
            if (password === null ) return

            const json = await PandoraPay.wallet.manager.getWalletAddress( password, this.address.addressEncoded );
            if (!json) return false;

            const fileName = consts.name + "_" +this.address.name + "_"+this.address.addressEncoded + ".pandora";

            const file = new Blob([json], {type: "application/json;charset=utf-8"});
            FileSaver.saveAs(file, fileName);

            this.$store.dispatch('addToast', {
                type: 'success',
                title: `Address ${this.address.name} has been saved in your machine`,
                text: `The address ${this.address.addressEncoded} has been saved in the downloads folder.`,
            });


        },

        handleShowPrivateKey(){
            return this.$refs.refAccountPrivateKeyModal.showModal(this.address);
        },

        handleDeleteAddress(){
            return this.$refs.refAccountDeleteModal.showModal(this.address)
        },

        handleCopyAddress(key){

            this.$copyText(key).then(
                e => this.$store.dispatch('addToast', {
                    type: 'success',
                    title: `Copied to clipboard successfully`,
                    text: `${key} copied to clipboard`,
                }),
                e => this.$store.dispatch('addToast', {
                    type: 'error',
                    title: `Clipboard failed`,
                    text: `Failed to copy to clipboard`,
                })
            )

        }

    },

}
</script>

<style scoped>
</style>
