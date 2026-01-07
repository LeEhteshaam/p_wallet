<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Alert from "$lib/components/ui/alert/index.js";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { walletCreation } from "$lib/stores/walletCreationStore";
    import {
        getBalance,
        sendUniversalTransaction,
        estimateTransactionFee
    } from "$lib/utils/blockchain";
    import type { HDNodeWallet } from "ethers";

    // Wallet state
    let wallet: HDNodeWallet | null = $state(null);
    let address = $state("");
    let balance = $state("0");
    let isLoading = $state(true);
    let isRefreshing = $state(false);

    // Transaction state
    let showSendModal = $state(false);
    let toAddress = $state("");
    let amount = $state("");
    let dataPayload = $state("");
    let isSending = $state(false);
    let isEstimating = $state(false);
    let txHash = $state("");
    let txError = $state("");
    let estimatedFee = $state("");

    onMount(async () => {
        const state = walletCreation.get();

        // Guard: redirect if no wallet
        if (!state.wallet) {
            goto("/login");
            return;
        }

        wallet = state.wallet;
        address = wallet.address;

        await refreshBalance();
        isLoading = false;
    });

    async function refreshBalance() {
        if (!address) return;

        isRefreshing = true;
        try {
            balance = await getBalance(address);
        } catch (error) {
            console.error("Failed to fetch balance:", error);
            balance = "Error";
        }
        isRefreshing = false;
    }

    function handleLogout() {
        walletCreation.clear();
        goto("/login");
    }

    function shortenAddress(addr: string): string {
        if (!addr) return "";
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }

    async function copyAddress() {
        await navigator.clipboard.writeText(address);
    }

    function openSendModal() {
        // Reset form
        toAddress = "";
        amount = "";
        dataPayload = "";
        txHash = "";
        txError = "";
        estimatedFee = "";
        showSendModal = true;
    }

    function closeSendModal() {
        showSendModal = false;
    }

    async function handleEstimate() {
        if (!address || !toAddress || !amount) return;

        txError = "";
        isEstimating = true;

        try {
            estimatedFee = await estimateTransactionFee(
                address,
                toAddress,
                amount,
                dataPayload || "0x"
            );
        } catch (error) {
            console.error("Estimation failed:", error);
            txError = error instanceof Error ? error.message : "Failed to estimate gas";
            estimatedFee = "";
        } finally {
            isEstimating = false;
        }
    }

    async function handleSend() {
        if (!wallet || !toAddress || !amount) return;

        txError = "";
        txHash = "";
        isSending = true;

        try {
            const tx = await sendUniversalTransaction(
                wallet,
                toAddress,
                amount,
                dataPayload || "0x",
            );

            txHash = tx.hash;

            // Refresh balance after a short delay
            setTimeout(refreshBalance, 3000);
        } catch (error) {
            console.error("Transaction failed:", error);
            txError =
                error instanceof Error ? error.message : "Transaction failed";
        } finally {
            isSending = false;
        }
    }

    // Auto-estimate when inputs change
    $effect(() => {
        if (toAddress && amount && address) {
            handleEstimate();
        } else {
            estimatedFee = "";
        }
    });
</script>

<div class="flex items-center justify-center min-h-screen bg-background p-4">
    <Card.Root class="w-full max-w-md">
        <Card.Header>
            <div class="flex items-center justify-between">
                <Card.Title class="text-2xl">P-Wallet</Card.Title>
                <Button variant="outline" size="sm" onclick={handleLogout}>
                    Logout
                </Button>
            </div>
            <Card.Description>Your Ethereum Wallet</Card.Description>
        </Card.Header>
        <Card.Content>
            {#if isLoading}
                <div class="flex items-center justify-center py-8">
                    <p class="text-muted-foreground">Loading...</p>
                </div>
            {:else}
                <div class="flex flex-col gap-6">
                    <!-- Address Display -->
                    <div class="rounded-lg border p-4 text-center">
                        <p class="text-xs text-muted-foreground mb-1">
                            Address
                        </p>
                        <button
                            class="font-mono text-sm hover:text-primary cursor-pointer"
                            onclick={copyAddress}
                            title="Click to copy full address"
                        >
                            {shortenAddress(address)}
                        </button>
                    </div>

                    <!-- Balance Display -->
                    <div class="text-center">
                        <div class="flex items-center justify-center gap-2">
                            <p class="text-2xl font-bold">
                                {isRefreshing ? "..." : balance}
                            </p>
                            <button
                                class="text-muted-foreground hover:text-primary"
                                onclick={refreshBalance}
                                disabled={isRefreshing}
                                title="Refresh balance"
                            >
                                🔄
                            </button>
                        </div>
                        <p class="text-muted-foreground">ETH</p>
                    </div>

                    <!-- Action Buttons -->
                    <div>
                        <Button class="w-full" onclick={openSendModal}>
                            📤 Send
                        </Button>
                    </div>
                </div>
            {/if}
        </Card.Content>
    </Card.Root>
</div>

<!-- Send Transaction Modal -->
{#if showSendModal}
    <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
        <Card.Root class="w-full max-w-md">
            <Card.Header>
                <Card.Title>Send Transaction</Card.Title>
                <Card.Description>
                    Send ETH or interact with a smart contract
                </Card.Description>
            </Card.Header>
            <Card.Content>
                <div class="flex flex-col gap-4">
                    {#if txError}
                        <Alert.Root variant="destructive">
                            <Alert.Title>Error</Alert.Title>
                            <Alert.Description>{txError}</Alert.Description>
                        </Alert.Root>
                    {/if}

                    {#if txHash}
                        <Alert.Root>
                            <Alert.Title>Transaction Sent! ✓</Alert.Title>
                            <Alert.Description>
                                <p class="text-xs font-mono break-all">
                                    {txHash}
                                </p>
                            </Alert.Description>
                        </Alert.Root>
                    {/if}

                    <div class="grid gap-2">
                        <Label for="toAddress">Recipient Address</Label>
                        <Input
                            id="toAddress"
                            type="text"
                            bind:value={toAddress}
                            placeholder="0x..."
                            disabled={isSending}
                        />
                    </div>

                    <div class="grid gap-2">
                        <Label for="amount">Amount (ETH)</Label>
                        <Input
                            id="amount"
                            type="text"
                            bind:value={amount}
                            placeholder="0.01"
                            disabled={isSending}
                        />
                    </div>

                    <div class="grid gap-2">
                        <Label for="dataPayload">Data Payload (Optional)</Label>
                        <Input
                            id="dataPayload"
                            type="text"
                            bind:value={dataPayload}
                            placeholder="0x (for contract calls)"
                            disabled={isSending}
                        />
                        <p class="text-xs text-muted-foreground">
                            Leave empty for simple ETH transfers
                        </p>
                    </div>

                    <!-- Gas Fee Display -->
                    {#if estimatedFee}
                        <div class="rounded-lg border bg-muted/50 p-3 text-sm space-y-1">
                            <div class="flex justify-between">
                                <span class="text-muted-foreground">Amount:</span>
                                <span class="font-mono">{amount} ETH</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-muted-foreground">Gas Fee:</span>
                                <span class="font-mono">{estimatedFee} ETH</span>
                            </div>
                            <div class="flex justify-between border-t pt-1 font-semibold">
                                <span>Total Cost:</span>
                                <span class="font-mono">
                                    {(parseFloat(amount) + parseFloat(estimatedFee)).toFixed(6)} ETH
                                </span>
                            </div>
                        </div>
                    {:else if isEstimating}
                        <div class="rounded-lg border bg-muted/50 p-3 text-center text-sm text-muted-foreground">
                            Estimating gas fee...
                        </div>
                    {/if}
                </div>
            </Card.Content>
            <Card.Footer class="flex-col gap-2">
                <Button
                    class="w-full"
                    onclick={handleSend}
                    disabled={isSending || !toAddress || !amount}
                >
                    {#if isSending}
                        Sending...
                    {:else}
                        Send Transaction
                    {/if}
                </Button>
                <Button
                    variant="outline"
                    class="w-full"
                    onclick={closeSendModal}
                    disabled={isSending}
                >
                    {txHash ? "Close" : "Cancel"}
                </Button>
            </Card.Footer>
        </Card.Root>
    </div>
{/if}
