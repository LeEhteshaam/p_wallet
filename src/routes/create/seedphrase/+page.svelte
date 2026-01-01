<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Alert from "$lib/components/ui/alert/index.js";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { generateMnemonic } from "$lib/utils/crypto";
    import { Mnemonic, HDNodeWallet } from "ethers";
    import { walletCreation } from "$lib/stores/walletCreationStore";
    import { saveEncryptedWallet } from "$lib/walletStore"; // Import the bridge we made

    let seedWords = $state<string[]>([]);
    let passphrase = $state("");
    let copied = $state(false);
    let confirmed = $state(false);
    let isProcessing = $state(false);

    onMount(() => {
        const state = walletCreation.get();

        if (!state.password) {
            goto("/create/password");
            return;
        }

        passphrase = state.passphrase;

        const mnemonicPhrase = generateMnemonic();
        seedWords = mnemonicPhrase.split(" ");

        const mnemonic = Mnemonic.fromPhrase(mnemonicPhrase, passphrase);
        const seed = mnemonic.computeSeed();

        walletCreation.setMnemonic(mnemonicPhrase);
        walletCreation.setSeed(seed);
    });

    async function copyToClipboard() {
        const phrase = seedWords.join(" ");
        await navigator.clipboard.writeText(phrase);
        copied = true;
        setTimeout(() => (copied = false), 2000);
    }

    async function handleContinue() {
        if (!confirmed || isProcessing) return;

        isProcessing = true;

        try {
            const state = walletCreation.get();
            const wallet = HDNodeWallet.fromPhrase(
                state.mnemonic,
                state.passphrase,
            );

            await saveEncryptedWallet(wallet, state.password);
            walletCreation.clear();

            goto("/");
        } catch (error) {
            console.error("Encryption failed:", error);
            alert("Failed to save wallet. Please try again.");
            isProcessing = false; // Unlock button on error
        }
    }

    function handleBack() {
        walletCreation.setMnemonic("");
        walletCreation.setSeed("");
        walletCreation.setPassphrase("");
        goto("/create/passphrase");
    }
</script>

<div class="flex items-center justify-center min-h-screen bg-background p-4">
    <Card.Root class="w-full max-w-sm">
        <Card.Header>
            <Card.Title class="text-2xl">Recovery Phrase</Card.Title>
            <Card.Description>
                Write down this 12-word Secret Recovery Phrase and save it in a
                place that you trust and only you can access.
            </Card.Description>
        </Card.Header>
        <Card.Content>
            <div class="flex flex-col gap-4">
                {#if passphrase}
                    <Alert.Root>
                        <Alert.Title>Passphrase Active</Alert.Title>
                        <Alert.Description>
                            You'll need both seed phrase AND passphrase to
                            recover.
                        </Alert.Description>
                    </Alert.Root>
                {/if}

                <div
                    class="rounded-md border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 p-3"
                >
                    <p class="text-xs text-blue-800 dark:text-blue-200">
                        <span class="font-semibold">💡 Tip:</span> Write down and
                        store the seedphrase + passphrase (if you have one) in multiple
                        secure and secret places (like safety deposit boxes)!
                    </p>
                </div>

                <div class="grid grid-cols-3 gap-2">
                    {#each seedWords as word, index}
                        <div
                            class="flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1.5"
                        >
                            <span
                                class="text-xs text-muted-foreground font-mono"
                            >
                                {index + 1}.
                            </span>
                            <span class="font-medium text-sm">{word}</span>
                        </div>
                    {/each}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    class="w-full"
                    onclick={copyToClipboard}
                >
                    {copied ? "✓ Copied!" : "Copy to Clipboard"}
                </Button>

                <label class="flex items-start gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        bind:checked={confirmed}
                        class="mt-0.5 h-4 w-4 rounded border-gray-300"
                    />
                    <span class="text-xs text-muted-foreground">
                        I have saved my recovery phrase securely.
                    </span>
                </label>
            </div>
        </Card.Content>
        <Card.Footer class="flex-col gap-2">
            <Button
                class="w-full"
                onclick={handleContinue}
                disabled={!confirmed || isProcessing}
            >
                {#if isProcessing}
                    Encrypting...
                {:else}
                    Continue to Wallet
                {/if}
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
