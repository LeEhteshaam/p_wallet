<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { loadEncryptedWallet } from "$lib/walletStore";
    import { walletCreation } from "$lib/stores/walletCreationStore";
    import { goto } from "$app/navigation";

    let password = $state("");
    let isLoading = $state(false);
    let error = $state("");

    async function handleLogin() {
        isLoading = true;
        error = "";

        try {
            const wallet = await loadEncryptedWallet(password, (percent) => {
                console.log(`Decrypting: ${Math.round(percent * 100)}%`);
            });
            walletCreation.setWallet(wallet);
            goto("/home");
        } catch (err) {
            error = "Incorrect password or wallet file not found.";
            console.error(err);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="flex items-center justify-center min-h-screen bg-background">
    <Card.Root class="w-full max-w-sm">
        <Card.Header>
            <div class="flex items-center justify-between">
                <Card.Title class="text-2xl">P-Wallet</Card.Title>
            </div>
            <Card.Description>Unlock your wallet to continue</Card.Description>
        </Card.Header>
        <Card.Content>
            <form onsubmit={handleLogin}>
                <div class="flex flex-col gap-6">
                    <div class="grid gap-2">
                        <div class="flex items-center">
                            <Label for="password">Password</Label>
                            <a
                                href="/recover"
                                class="ms-auto inline-block text-sm underline-offset-4 hover:underline"
                            >
                                Forgot your password?
                            </a>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            bind:value={password}
                            placeholder="Enter your password"
                            required
                        />
                        {#if error}
                            <p class="text-sm text-destructive">{error}</p>
                        {/if}
                    </div>
                    <Button type="submit" class="w-full" disabled={isLoading}>
                        {isLoading ? "Unlocking..." : "Login"}
                    </Button>
                </div>
            </form>
        </Card.Content>
        <Card.Footer class="flex-col gap-2"></Card.Footer>
    </Card.Root>
</div>
