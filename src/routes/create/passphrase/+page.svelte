<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { goto } from "$app/navigation";

    let passphrase = $state("");

    function handleContinue() {
        goto("/create/seed", {
            state: { passphrase },
        });
    }

    function handleSkip() {
        goto("/create/seed", {
            state: { passphrase: "" },
        });
    }
</script>

<div class="flex items-center justify-center min-h-screen bg-background">
    <Card.Root class="w-full max-w-sm">
        <Card.Header>
            <Card.Title class="text-2xl">Add Passphrase</Card.Title>
            <Card.Description>
                Optional extra security layer combined with your seed phrase.
            </Card.Description>
        </Card.Header>
        <Card.Content>
            <form
                onsubmit={(e) => {
                    e.preventDefault();
                    handleContinue();
                }}
            >
                <div class="flex flex-col gap-6">
                    <div class="grid gap-2">
                        <div class="flex items-center">
                            <Label for="passphrase">Passphrase</Label>
                            <button
                                type="button"
                                onclick={handleSkip}
                                class="ms-auto inline-block text-sm underline-offset-4 hover:underline text-muted-foreground"
                            >
                                Skip
                            </button>
                        </div>
                        <Input
                            id="passphrase"
                            type="password"
                            bind:value={passphrase}
                            placeholder="Enter your passphrase"
                        />
                    </div>
                </div>
            </form>
        </Card.Content>
        <Card.Footer class="flex-col gap-2">
            <Button class="w-full" onclick={handleContinue}>
                Continue
            </Button>
            <Button variant="outline" class="w-full" onclick={() => goto("/create/password")}>
                Back
            </Button>
        </Card.Footer>
    </Card.Root>
</div>
