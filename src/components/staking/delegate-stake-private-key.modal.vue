<template>

    <modal ref="modal" title="View Delegate Stake Private key" >

        <span class="thick">Private Key of Delegate Stake</span>

        <secret-text v-if="privateKey" class="pt-3" :text="privateKey" title="Private Key" warning="STAKE ON YOUR BEHALF AND TAKE YOUR REWARDS" />

        <alert-box v-if="error" type="error">{{error}}</alert-box>

    </modal>

</template>

<script>

import Modal from "src/components/utils/modal"
import LoadingButton from "src/components/utils/loading-button.vue"
import SecretText from "src/components/utils/secret-text"
import AlertBox from "src/components/utils/alert-box"

export default {

    components: { Modal, LoadingButton, SecretText, AlertBox },

    data(){
        return {

            delegate: null,

            privateKey: '',

            error:'',
            errorMismatch: true,
        }
    },

    props:{
        address: {default: null},
    },

    computed:{

    },

    methods: {

        showModal(delegate,) {

            Object.assign(this.$data, this.$options.data());

            this.delegate = delegate;

            this.handleShowPrivateKey( () => { });

            return this.$refs.modal.showModal();
        },

        closeModal() {
            this.$refs.modal.closeModal();
        },

        async handleShowPrivateKey(){

            try{

                this.error = '';

                const addressWallet = PandoraPay.wallet.manager.getWalletAddressByAddress( this.address.addressEncoded, false);
                const delegateStakePrivateKeyModel = addressWallet.decryptGetDelegateStakePrivateKeyModel(this.delegate.delegateStakeNonce );
                const delegateStakeAddressModel = delegateStakePrivateKeyModel.getAddressPublicKey();

                const delegateStakePublicKey = delegateStakeAddressModel.publicKey.toString("hex");
                if (delegateStakePublicKey !== this.delegate.delegateStakePublicKey)
                    throw Error('Either the (delegateStakeNonce, delegateStakePublicKey) are not right or the delegateStakePublicKey was set manually');

                const privateKey = delegateStakePrivateKeyModel.privateKey;
                this.privateKey = privateKey.toString("hex");

            }catch(err){
                this.error = err.message;
            }finally{

            }

        },

        copyPrivateKey(){

            this.$copyText(this.privateKey).then(
                e => this.$store.dispatch('addToast', {
                        type: 'success',
                        title: `Copied to clipboard successfully`,
                        text: `Private Key ${this.privateKey} copied to clipboard`,
                    }),
                e => this.$store.dispatch('addToast', {
                        type: 'error',
                        title: `Clipboard failed`,
                        text: `Failed to copy to clipboard`,
                    })
            )

        }

    }

}
</script>

<style scoped>
    span{
        display: inline-block
    }
    .wordwrap{
        display: block;
    }
</style>
