<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { walletExists } from "$lib/walletStore";

    let isLoading = $state(true);

    onMount(async () => {
        // Check if wallet already exists
        const exists = await walletExists();
        if (exists) {
            goto("/login");
            return;
        }
        isLoading = false;
    });
</script>

{#if isLoading}
    <div class="flex items-center justify-center min-h-screen bg-background">
        <p class="text-muted-foreground">Loading...</p>
    </div>
{:else}
    <div
        class="flex items-center justify-center min-h-screen bg-background p-4"
    >
        <Card.Root class="w-full max-w-sm">
            <Card.Header class="text-center">
                <Card.Title class="text-2xl">Welcome to P-Wallet</Card.Title>
                <Card.Description>
                    Your secure HD Ethereum wallet
                </Card.Description>
            </Card.Header>
            <Card.Content>
                <div class="flex flex-col gap-4">
                    <Button
                        class="w-full"
                        size="lg"
                        onclick={() => goto("/create/password")}
                    >
                        Create New Wallet
                    </Button>

                    <div class="relative">
                        <div class="absolute inset-0 flex items-center">
                            <span class="w-full border-t"></span>
                        </div>
                        <div
                            class="relative flex justify-center text-xs uppercase"
                        >
                            <span
                                class="bg-background px-2 text-muted-foreground"
                            >
                                or
                            </span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        class="w-full"
                        size="lg"
                        onclick={() => goto("/import")}
                    >
                        Import Existing Wallet
                    </Button>
                </div>
            </Card.Content>
            <Card.Footer class="flex-col gap-2">
                <p class="text-xs text-center text-muted-foreground">
                    Already have a wallet? Use your 12-word recovery phrase to
                    import it.
                </p>
            </Card.Footer>
        </Card.Root>
    </div>
{/if}
