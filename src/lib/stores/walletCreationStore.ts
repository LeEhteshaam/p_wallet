import { writable, get } from 'svelte/store';

interface WalletCreationState {
    password: string;
    passphrase: string;
    mnemonic: string;
    seed: string;
}

const initialState: WalletCreationState = {
    password: '',
    passphrase: '',
    mnemonic: '',
    seed: ''
};

function createWalletCreationStore() {
    const store = writable<WalletCreationState>(initialState);
    const { subscribe, set, update } = store;

    return {
        subscribe,
        setPassword: (password: string) => update(state => ({ ...state, password })),
        setPassphrase: (passphrase: string) => update(state => ({ ...state, passphrase })),
        setMnemonic: (mnemonic: string) => update(state => ({ ...state, mnemonic })),
        setSeed: (seed: string) => update(state => ({ ...state, seed })),
        clear: () => set(initialState),
        get: () => get(store)
    };
}

export const walletCreation = createWalletCreationStore();