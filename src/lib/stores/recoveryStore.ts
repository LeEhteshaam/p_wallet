/**
 * Temporary store for recovery flow data.
 * Used to pass verified mnemonic/passphrase from /recover to /recover/password
 * without using sessionStorage (which can be problematic in Tauri).
 */

let recoveryMnemonic: string | null = null;
let recoveryPassphrase: string | null = null;

export const recoveryStore = {
    /**
     * Set recovery data after successful verification
     */
    set(mnemonic: string, passphrase: string) {
        recoveryMnemonic = mnemonic;
        recoveryPassphrase = passphrase;
    },

    /**
     * Get recovery data (returns null if not set)
     */
    get(): { mnemonic: string; passphrase: string } | null {
        if (recoveryMnemonic === null) {
            return null;
        }
        return {
            mnemonic: recoveryMnemonic,
            passphrase: recoveryPassphrase || ''
        };
    },

    /**
     * Check if recovery data exists
     */
    hasData(): boolean {
        return recoveryMnemonic !== null;
    },

    /**
     * Clear recovery data (call after password reset or on cancel)
     */
    clear() {
        recoveryMnemonic = null;
        recoveryPassphrase = null;
    }
};
