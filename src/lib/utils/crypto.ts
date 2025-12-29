import {Wallet, Mnemonic, HDNodeWallet} from 'ethers';

// Generate a random Mnemonics with Entropy 
export function generateMnemonic() {
    const randomWallet = Wallet.createRandom();
    if (!randomWallet.mnemonic) {
        throw new Error('Failed to generate mnemonic');
    }
    return randomWallet.mnemonic.phrase;
}

// Passphrase 

export function askPassphrase() {
    const wantsPassphrase = confirm('Would you like to add a passphrase (extra security)?');
    
    if (!wantsPassphrase) {
        return '';
    }
    
    let passphrase = '';
    while (!passphrase.trim()) {
        passphrase = prompt('Enter your passphrase (cannot be empty):') || '';
        if (!passphrase.trim()) {
            alert('Passphrase cannot be empty. Please try again.');
        }
    }
    
    return passphrase.trim();
}

// Generate Seed
export function getSeed(){
    const mnemonicPhrase = generateMnemonic();
    const passphrase = askPassphrase();
    const mnemonic = Mnemonic.fromPhrase(mnemonicPhrase, passphrase);
    const seed = mnemonic.computeSeed();

    return {
        mnemonic: mnemonicPhrase,
        passphrase: passphrase,
        seed: seed 
    }; 
}

// Generate the Master Node
export function getMasterNode(seed: string) {
    const HDNode = HDNodeWallet.fromSeed(seed);
    return HDNode;
}

// Generate the Child NOde
export function getChildren(masterNode :HDNodeWallet, index: number) {
    const child = masterNode.derivePath(`m/44'/60'/0'/0/${index}`);
    return child;
}







 