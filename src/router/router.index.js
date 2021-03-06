import VueRouter from "vue-router"
import Vue from "vue";

import LoginPage from "src/pages/login/login.page"
import SendTransparentTransferPage from "src/pages/send/transparent/send-transparent-transfer.page"
import ReceivePage from "src/pages/receive/receive.page"
import WalletPage from "src/pages/wallet/wallet.page"
import AddressPage from "src/pages/address/address.page"
import StakingPage from "src/pages/staking/staking.page"
import SetPasswordPage from "src/pages/encryption/set-password.page"
import RemovePasswordPage from "src/pages/encryption/remove-password.page"
import BlockchainExplorerPage from "src/pages/explorer/blockchain-explorer.page"
import BlockExplorerPage from "src/pages/explorer/block-explorer.page"
import TransactionExplorerPage from "src/pages/explorer/transaction-explorer.page"
import TokenExplorerPage from "src/pages/explorer/token-explorer.page.vue"
import MemPoolExplorerPage from "src/pages/explorer/mem-pool-explorer.page"
import TokensPage from "src/pages/tokens/tokens.page.vue"
import NotFoundPage from "src/pages/not-found/not-found.page"

import KadPage from "src/pages/kad/kad.page"

Vue.use(VueRouter);

import store from "./../store/store"

const guardDecrypted = (to, from, next) => {

//    if (store.state.wallet.initialized && !store.state.wallet.loaded ) return next('/login');
    next();

};

const guardLogin = (to, from, next) =>{

//    if (store.state.wallet.initialized && store.state.wallet.loaded ) return next('/');
    next();

};

const routes = [

    {path: '/send', component: SendTransparentTransferPage, beforeEnter: guardDecrypted },

    {path: '/receive', component: ReceivePage, beforeEnter: guardDecrypted },
    {path: '/wallet', component: WalletPage, beforeEnter: guardDecrypted },

    {path: '/set-password', component: SetPasswordPage , beforeEnter: guardDecrypted},
    {path: '/remove-password', component: RemovePasswordPage, beforeEnter: guardDecrypted },

    {path: '/explorer/block/:query', component: BlockExplorerPage },
    {path: '/explorer/tx/:query', component: TransactionExplorerPage
    },
    {path: '/explorer/mem-pool', component: MemPoolExplorerPage },
    {path: '/explorer/mem-pool/:page', component: MemPoolExplorerPage },

    {path: '/explorer', component: BlockchainExplorerPage },
    {path: '/explorer/:page', component: BlockchainExplorerPage },

    {path: '/tokens', component: TokensPage},
    {path: '/tokens/pandora', component: TokenExplorerPage },
    {path: '/tokens/:hash', component: TokenExplorerPage },

    {path: '/staking', component: StakingPage, beforeEnter: guardDecrypted },

    {path: '/kad', component: KadPage },

    {path: '/login', component: LoginPage, beforeEnter: guardLogin },

    {path: '/', component: AddressPage, beforeEnter: guardDecrypted },
    {path: '/address/:address', component: AddressPage, beforeEnter: guardDecrypted  },
    {path: '/address/:address/:page', component: AddressPage, beforeEnter: guardDecrypted  },

    { path: '*', name: 'not-found', component: NotFoundPage,}

];

const router = new VueRouter({
    base: PandoraPayWalletOptions.router.base || '/',
    mode: PandoraPayWalletOptions.router.mode || 'history',
    scrollBehavior(to, from, savedPosition) {
        if (to.hash && to.hash.length > 1) return { selector: to.hash }
        else if (savedPosition) return savedPosition;
        else return { x: 0, y: 0 }
    },
    routes // short for `routes: routes`
});

export default router;
