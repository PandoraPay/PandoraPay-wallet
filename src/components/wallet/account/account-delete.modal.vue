<template>
    <modal ref="modal" :title="`Delete Address ${title ? ': ' + title : ''}`">

        <template slot="body" v-if="account">
            <p>Are you sure you want to <b>delete</b> address {{this.account.name}} - {{this.account.addressEncoded}} ? </p>
        </template>

        <template slot="footer">
            <alert-box v-if="error" class="w-100" type="error">{{error}}</alert-box>

            <button class="btn btn-falcon-danger" type="button" @click="handleDelete">
                <i class="fa fa-times"></i> Yes, Delete account
            </button>
            <button class="btn btn-falcon-secondary" type="button" @click="closeModal">
                <i class="fa fa-ban"></i> Close
            </button>
        </template>

    </modal>
</template>

<script>
import Modal from "src/components/utils/modal"
import AlertBox from "../../utils/alert-box";
import UtilsHelper from "src/utils/utils-helper";
export default {

    components: { Modal, AlertBox},

    data() {
        return {
            error: '',
            account: null,
            title: "",
        }
    },

    methods: {

        async showModal(account) {

            Object.assign(this.$data, this.$options.data());

            this.account = account;
            this.title = account.name;

            return this.$refs.modal.showModal();

        },

        closeModal() {
            return this.$refs.modal.closeModal();
        },

        async handleDelete(){

            this.$store.state.page.refLoadingModal.showModal();

            await UtilsHelper.sleep(50 )

            const address = this.account

            try{

                const password = await this.$store.state.page.refWalletPasswordModal.showModal()
                if (password === null ) return

                const out = await PandoraPay.wallet.manager.removeWalletAddress( password, address.addressEncoded );
                if (out) {
                    this.$store.dispatch('addToast', {
                        type: 'success',
                        title: `Address ${address.name} has been removed successfully`,
                        text: `The address ${address.addressEncoded} has been removed and deleted from your wallet`,
                    });
                    this.$store.commit('removeWalletAddress', address)
                }

            }catch(err){
                this.$store.dispatch('addToast', {
                    type: 'error',
                    title: `Address ${address.addressEncoded} could not been removed`,
                    text: `Raised an error ${err.message}`,
                })
            }finally{
                this.$store.state.page.refLoadingModal.closeModal();
            }


            this.closeModal()
        },

    }

}
</script>

<style scoped>
</style>
