import { invoke } from '@tauri-apps/api/core';
import { HDNodeWallet, Wallet } from 'ethers';

export async function saveEncryptedWallet(wallet: HDNodeWallet, password: string): Promise<boolean> {
    // Encrypt locally using Ethers (Scrypt + AES-128-CTR)
    const encryptedJson = await wallet.encrypt(password);

    // Send the encrypted string to Rust to be saved
    await invoke('save_wallet_file', { 
        data: encryptedJson 
    });
    
    return true;
}

/**
 * Check if a wallet keystore file exists
 */
export async function walletExists(): Promise<boolean> {
    return await invoke<boolean>('wallet_exists');
}

/**
 * Load and decrypt the wallet from the keystore file
 * @param password - The password to decrypt the wallet
 * @param progress - Optional callback for decryption progress (0-1)
 * @returns The decrypted HDNodeWallet, or null if decryption fails
 */
export async function loadEncryptedWallet(
    password: string,
    progress?: (percent: number) => void
): Promise<HDNodeWallet | null> {
    const exists = await walletExists();
    if (!exists) {
        throw new Error('No wallet file found');
    }

    const encryptedJson = await invoke<string>('read_wallet_file');

    const wallet = await Wallet.fromEncryptedJson(encryptedJson, password, progress);

    if (wallet instanceof HDNodeWallet) {
        return wallet;
    }

    return wallet as unknown as HDNodeWallet;
}