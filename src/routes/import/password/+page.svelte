<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Alert from "$lib/components/ui/alert/index.js";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { HDNodeWallet } from "ethers";
    import { walletCreation } from "$lib/stores/walletCreationStore";
    import { saveEncryptedWallet } from "$lib/walletStore";

    let password = $state("");
    let confirmPassword = $state("");
    let errorMessage = $state("");
    let showError = $state(false);
    let isProcessing = $state(false);

    onMount(() => {
        // Guard: redirect if no mnemonic data
        const state = walletCreation.get();
        if (!state.mnemonic) {
            goto("/import");
        }
    });

    function passwordsMatch(): boolean {
        if (password !== confirmPassword) {
            errorMessage = "Passwords do not match. Please try again.";
            showError = true;
            return false;
        }
        return true;
    }

    function isPasswordStrong(): boolean {
        const minLength = 12;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
            password,
        );

        const errors: string[] = [];

        if (password.length < minLength) {
            errors.push(
                `At least ${minLength} characters (you have ${password.length})`,
            );
        }
        if (!hasUppercase) {
            errors.push("At least 1 uppercase letter (A-Z)");
        }
        if (!hasLowercase) {
            errors.push("At least 1 lowercase letter (a-z)");
        }
        if (!hasNumber) {
            errors.push("At least 1 number (0-9)");
        }
        if (!hasSpecial) {
            errors.push("At least 1 special character (!@#$%^&*)");
        }

        if (errors.length > 0) {
            errorMessage = errors.join("\n");
            showError = true;
            return false;
        }

        return true;
    }

    function clearError() {
        showError = false;
        errorMessage = "";
    }

    async function handleSubmit() {
        clearError();

        if (!isPasswordStrong()) {
            return;
        }
        if (!passwordsMatch()) {
            return;
        }

        const state = walletCreation.get();
        if (!state.mnemonic) {
            errorMessage = "Import data lost. Please start over.";
            showError = true;
            return;
        }

        isProcessing = true;

        try {
            // Derive wallet from imported mnemonic + passphrase
            const wallet = HDNodeWallet.fromPhrase(
                state.mnemonic,
                state.passphrase,
            );

            // Encrypt and save via Tauri backend
            await saveEncryptedWallet(wallet, password);
            walletCreation.setWallet(wallet);

            // Navigate to home on success
            goto("/home");
        } catch (error) {
            console.error("Import failed:", error);
            errorMessage = "Failed to import wallet. Please try again.";
            showError = true;
            isProcessing = false;
        }
    }

    function handleBack() {
        goto("/import");
    }
</script>

<div class="flex items-center justify-center min-h-screen bg-background p-4">
    <Card.Root class="w-full max-w-sm">
        <Card.Header>
            <Card.Title class="text-2xl">Set Encryption Password</Card.Title>
            <Card.Description>
                Create a strong password to encrypt your imported wallet on this
                device.
            </Card.Description>
        </Card.Header>
        <Card.Content>
            <form
                onsubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <div class="flex flex-col gap-4">
                    {#if showError}
                        <Alert.Root variant="destructive">
                            <Alert.Title>Password Requirements</Alert.Title>
                            <Alert.Description class="whitespace-pre-line">
                                {errorMessage}
                            </Alert.Description>
                        </Alert.Root>
                    {/if}

                    <div
                        class="rounded-md border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 p-3"
                    >
                        <p class="text-xs text-blue-800 dark:text-blue-200">
                            <span class="font-semibold">💡 Note:</span> This password
                            encrypts your wallet locally. It's different from your
                            recovery passphrase (if you have one).
                        </p>
                    </div>

                    <div class="grid gap-2">
                        <Label for="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            bind:value={password}
                            placeholder="Enter a strong password"
                            required
                            disabled={isProcessing}
                            oninput={clearError}
                        />
                    </div>

                    <div class="grid gap-2">
                        <Label for="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            bind:value={confirmPassword}
                            placeholder="Confirm your password"
                            required
                            disabled={isProcessing}
                            oninput={clearError}
                        />
                    </div>

                    <div class="text-xs text-muted-foreground space-y-1">
                        <p class="font-medium">Password must contain:</p>
                        <ul class="list-disc list-inside space-y-0.5">
                            <li>At least 12 characters</li>
                            <li>Uppercase & lowercase letters</li>
                            <li>At least 1 number</li>
                            <li>At least 1 special character</li>
                        </ul>
                    </div>

                    <Button
                        type="submit"
                        class="w-full"
                        disabled={isProcessing}
                    >
                        {#if isProcessing}
                            Encrypting & Saving...
                        {:else}
                            Import Wallet
                        {/if}
                    </Button>
                </div>
            </form>
        </Card.Content>
        <Card.Footer class="flex-col gap-2">
            <Button
                variant="outline"
                class="w-full"
                onclick={handleBack}
                disabled={isProcessing}
            >
                Back
            </Button>
        </Card.Footer>
    </Card.Root>
</div>
