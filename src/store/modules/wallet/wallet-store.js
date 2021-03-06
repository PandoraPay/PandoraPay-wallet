import actions from "./wallet-actions"
import mutations from "./wallet-mutations"
import getters from "./wallet-getters"

export default {

    state: {

        initialized: false, //wasm wallet initialized
        loaded: false, //wasm wallet decrypted

        isEncrypted: false,

        version: null,
        seed: null,
        seedIndex: null,
        count: null,
        countIndex: null,

        encrypted: null,

        addresses: {},

        mainPublicKeyHash: null,

    },

    actions,
    getters,
    mutations,

}
