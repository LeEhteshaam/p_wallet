import { invoke } from '@tauri-apps/api/core';
import { HDNodeWallet } from 'ethers';

export async function saveEncryptedWallet(wallet: HDNodeWallet, password: string): Promise<boolean> {
    // Encrypt locally using Ethers (Scrypt + AES-128-CTR)
    const encryptedJson = await wallet.encrypt(password);

    // Send the encrypted string to Rust to be saved
    await invoke('save_wallet_file', { 
        data: encryptedJson 
    });
    
    return true;
}