<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Alert from "$lib/components/ui/alert/index.js";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { resetWalletPassword } from "$lib/walletStore";
    import { recoveryStore } from "$lib/stores/recoveryStore";

    let password = $state("");
    let confirmPassword = $state("");
    let isProcessing = $state(false);
    let errorMessage = $state("");
    let showError = $state(false);

    let mnemonic = $state("");
    let passphrase = $state("");

    onMount(() => {
        // Get recovery data from store
        const recoveryData = recoveryStore.get();

        if (!recoveryData) {
            // No verified recovery phrase, redirect back
            goto("/recover");
            return;
        }

        mnemonic = recoveryData.mnemonic;
        passphrase = recoveryData.passphrase;
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

    async function handleResetPassword() {
        clearError();

        if (!isPasswordStrong()) {
            return;
        }
        if (!passwordsMatch()) {
            return;
        }

        isProcessing = true;

        try {
            await resetWalletPassword(mnemonic, passphrase, password);

            // Clear recovery store data
            recoveryStore.clear();

            // Redirect to login with success message
            goto("/login?recovered=true");
        } catch (err) {
            errorMessage = "Failed to reset password. Please try again.";
            showError = true;
            console.error(err);
        } finally {
            isProcessing = false;
        }
    }

    function handleBack() {
        goto("/recover");
    }
</script>

<div class="flex items-center justify-center min-h-screen bg-background p-4">
    <Card.Root class="w-full max-w-sm">
        <Card.Header>
            <Card.Title class="text-2xl">Set New Password</Card.Title>
            <Card.Description>
                Your recovery phrase has been verified. Create a new password
                for your wallet.
            </Card.Description>
        </Card.Header>
        <Card.Content>
            <div class="flex flex-col gap-4">
                <Alert.Root>
                    <Alert.Title>Recovery Verified ✓</Alert.Title>
                    <Alert.Description>
                        Your seed phrase matches. Set a strong new password
                        below.
                    </Alert.Description>
                </Alert.Root>

                {#if showError}
                    <Alert.Root variant="destructive">
                        <Alert.Title>Password Requirements Not Met</Alert.Title>
                        <Alert.Description>
                            <ul class="list-disc list-inside mt-2 space-y-1">
                                {#each errorMessage.split("\n") as error}
                                    <li>{error}</li>
                                {/each}
                            </ul>
                        </Alert.Description>
                    </Alert.Root>
                {/if}

                <div class="grid gap-2">
                    <Label for="password">New Password</Label>
                    <Input
                        id="password"
                        type="password"
                        bind:value={password}
                        placeholder="Enter new password"
                        oninput={clearError}
                        disabled={isProcessing}
                    />
                </div>

                <div class="grid gap-2">
                    <Label for="confirmPassword">Confirm Password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        bind:value={confirmPassword}
                        placeholder="Confirm new password"
                        oninput={clearError}
                        disabled={isProcessing}
                    />
                </div>
            </div>
        </Card.Content>
        <Card.Footer class="flex-col gap-2">
            <Button
                class="w-full"
                onclick={handleResetPassword}
                disabled={isProcessing || !password || !confirmPassword}
            >
                {isProcessing ? "Resetting..." : "Reset Password"}
            </Button>
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
