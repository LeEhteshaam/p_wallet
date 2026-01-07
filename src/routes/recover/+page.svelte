<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Alert from "$lib/components/ui/alert/index.js";
    import { goto } from "$app/navigation";
    import { verifyRecoveryPhrase } from "$lib/walletStore";
    import { walletCreation } from "$lib/stores/walletCreationStore";
    import { HDNodeWallet } from "ethers";

    let seedWords = $state<string[]>(Array(12).fill(""));
    let passphrase = $state("");
    let isVerifying = $state(false);
    let error = $state("");

    function handleWordInput(index: number, value: string) {
        // Handle paste of full phrase
        const words = value.trim().split(/\s+/);
        if (words.length === 12 && index === 0) {
            seedWords = words.map((w) => w.toLowerCase());
            return;
        }
        seedWords[index] = value.trim().toLowerCase();
    }

    function handlePaste(event: ClipboardEvent) {
        const pastedText = event.clipboardData?.getData("text") || "";
        const words = pastedText.trim().split(/\s+/);
        if (words.length === 12) {
            event.preventDefault();
            seedWords = words.map((w) => w.toLowerCase());
        }
    }

    async function handleVerify() {
        error = "";

        // Validate all words are filled
        const emptyIndex = seedWords.findIndex((w) => !w);
        if (emptyIndex !== -1) {
            error = `Word ${emptyIndex + 1} is empty. Please fill all 12 words.`;
            return;
        }

        isVerifying = true;

        try {
            const mnemonic = seedWords.join(" ");
            const isValid = await verifyRecoveryPhrase(mnemonic, passphrase);

            if (isValid) {
                walletCreation.setMnemonic(mnemonic);
                walletCreation.setPassphrase(passphrase);
                goto("/recover/password");
            } else {
                error =
                    "Recovery phrase does not match stored wallet. Please check your words and passphrase.";
            }
        } catch (err) {
            error = "Failed to verify recovery phrase. Please try again.";
            console.error(err);
        } finally {
            isVerifying = false;
        }
    }

    function handleBack() {
        goto("/login");
    }
</script>

<div class="flex items-center justify-center min-h-screen bg-background p-4">
    <Card.Root class="w-full max-w-md">
        <Card.Header>
            <Card.Title class="text-2xl">Recover Wallet</Card.Title>
            <Card.Description>
                Enter your 12-word recovery phrase to reset your password.
            </Card.Description>
        </Card.Header>
        <Card.Content>
            <div class="flex flex-col gap-4">
                {#if error}
                    <Alert.Root variant="destructive">
                        <Alert.Title>Error</Alert.Title>
                        <Alert.Description>{error}</Alert.Description>
                    </Alert.Root>
                {/if}

                <div class="grid grid-cols-3 gap-3" onpaste={handlePaste}>
                    {#each seedWords as word, index}
                        <div class="flex items-center gap-2">
                            <span
                                class="text-xs text-muted-foreground font-mono w-6 text-right"
                            >
                                {index + 1}.
                            </span>
                            <Input
                                type="text"
                                value={word}
                                oninput={(e) =>
                                    handleWordInput(
                                        index,
                                        e.currentTarget.value,
                                    )}
                                placeholder=""
                                class="text-sm px-2 h-9 flex-1"
                                autocomplete="off"
                                autocapitalize="off"
                            />
                        </div>
                    {/each}
                </div>

                <p class="text-xs text-muted-foreground text-center">
                    Tip: You can paste your entire 12-word phrase into the first
                    field
                </p>

                <div class="border-t pt-4">
                    <div class="grid gap-2">
                        <Label for="passphrase">Passphrase (Optional)</Label>
                        <Input
                            id="passphrase"
                            type="password"
                            bind:value={passphrase}
                            placeholder="Enter passphrase if you used one"
                        />
                        <p class="text-xs text-muted-foreground">
                            Only enter if you set a passphrase during wallet
                            creation.
                        </p>
                    </div>
                </div>
            </div>
        </Card.Content>
        <Card.Footer class="flex-col gap-2">
            <Button
                class="w-full"
                onclick={handleVerify}
                disabled={isVerifying}
            >
                {isVerifying ? "Verifying..." : "Verify & Continue"}
            </Button>
            <Button
                variant="outline"
                class="w-full"
                onclick={handleBack}
                disabled={isVerifying}
            >
                Back to Login
            </Button>
        </Card.Footer>
    </Card.Root>
</div>
