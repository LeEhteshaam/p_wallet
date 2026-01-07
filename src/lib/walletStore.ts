import { invoke } from '@tauri-apps/api/core';
import { HDNodeWallet, Wallet } from 'ethers';

export async function saveEncryptedWallet(wallet: HDNodeWallet, password: string): Promise<boolean> {
    // Encrypt locally using Ethers (Scrypt + AES-128-CTR)
    const encryptedJson = await wallet.encrypt(password);
    const address = wallet.address;

    // Send the encrypted string and public address to Rust to be saved
    await invoke('save_wallet_file', { 
        data: encryptedJson,
        address: address
    });
    
    return true;
}

export async function walletExists(): Promise<boolean> {
    return await invoke<boolean>('wallet_exists');
}

export async function getStoredAddress(): Promise<string> {
    return await invoke<string>('read_wallet_address');
}

/** 
 * Verify if a mnemonic + passphrase matches the stored wallet
 * @param mnemonic - The 12-word recovery phrase
 * @param passphrase - The optional passphrase (empty string if none)
 * @returns true if the derived address matches the stored address
 */
export async function verifyRecoveryPhrase(
    mnemonic: string,
    passphrase: string = ''
): Promise<boolean> {
    try {
        // Generate wallet from provided mnemonic + passphrase
        const wallet = HDNodeWallet.fromPhrase(mnemonic, passphrase);
        const derivedAddress = wallet.address;

        // Get the stored address
        const storedAddress = await getStoredAddress();

        // Compare addresses (case-insensitive)
        return derivedAddress.toLowerCase() === storedAddress.toLowerCase();
    } catch {
        return false;
    }
}

/**
 * Reset wallet password after successful recovery verification
 * @param mnemonic - The 12-word recovery phrase
 * @param passphrase - The optional passphrase
 * @param newPassword - The new password to encrypt the wallet with
 */
export async function resetWalletPassword(
    mnemonic: string,
    passphrase: string,
    newPassword: string
): Promise<boolean> {
    // Verify the recovery phrase first
    const isValid = await verifyRecoveryPhrase(mnemonic, passphrase);
    if (!isValid) {
        throw new Error('Recovery phrase does not match stored wallet');
    }

    // Regenerate wallet from mnemonic
    const wallet = HDNodeWallet.fromPhrase(mnemonic, passphrase);

    // Re-encrypt with new password and save (overwrites existing files)
    await saveEncryptedWallet(wallet, newPassword);

    return true;
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