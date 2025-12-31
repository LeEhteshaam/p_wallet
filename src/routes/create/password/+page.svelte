<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Alert from "$lib/components/ui/alert/index.js";
    import { goto } from "$app/navigation";
    import { walletCreation } from "$lib/stores/walletCreationStore";

    let password = $state("");
    let confirmPassword = $state("");
    let errorMessage = $state("");
    let showError = $state(false);

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

    function handleSubmit() {
        clearError();

        if (!isPasswordStrong()) {
            return;
        }
        if (!passwordsMatch()) {
            return;
        }

        // Use Svelte store instead of sessionStorage
        walletCreation.setPassword(password);

        goto("/create/passphrase");
    }
</script>

<div class="flex items-center justify-center min-h-screen bg-background">
    <Card.Root class="w-full max-w-sm">
        <Card.Header>
            <Card.Title class="text-2xl">Create Wallet</Card.Title>
            <Card.Description>
                Set a strong password to secure your wallet
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
                            <Alert.Title
                                >Password Requirements Not Met</Alert.Title
                            >
                            <Alert.Description>
                                <ul
                                    class="list-disc list-inside mt-2 space-y-1"
                                >
                                    {#each errorMessage.split("\n") as error}
                                        <li>{error}</li>
                                    {/each}
                                </ul>
                            </Alert.Description>
                        </Alert.Root>
                    {/if}

                    <div class="grid gap-2">
                        <Label for="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            bind:value={password}
                            placeholder="Enter password"
                            oninput={clearError}
                            required
                        />
                    </div>
                    <div class="grid gap-2">
                        <Label for="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            bind:value={confirmPassword}
                            placeholder="Re-enter password"
                            oninput={clearError}
                            required
                        />
                    </div>
                </div>
            </form>
        </Card.Content>
        <Card.Footer class="flex-col gap-2">
            <Button type="submit" class="w-full" onclick={handleSubmit}>
                Create Password
            </Button>
        </Card.Footer>
    </Card.Root>
</div>
