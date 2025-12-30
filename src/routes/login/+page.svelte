<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Card from "$lib/components/ui/card/index.js";

    let password = $state("");
</script>

<div class="flex items-center justify-center min-h-screen bg-background">
    <Card.Root class="w-full max-w-sm">
        <Card.Header>
            <div class="flex items-center justify-between">
                <Card.Title class="text-2xl">P-Wallet</Card.Title>
                <Button variant="link" class="p-0 h-auto"
                    >Make a New Wallet</Button
                >
            </div>
            <Card.Description>Unlock your wallet to continue</Card.Description>
        </Card.Header>
        <Card.Content>
            <form>
                <div class="flex flex-col gap-6">
                    <div class="grid gap-2">
                        <div class="flex items-center">
                            <Label for="password">Password</Label>
                            <a
                                href="/forgot-password"
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
                    </div>
                </div>
            </form>
        </Card.Content>
        <Card.Footer class="flex-col gap-2">
            <Button type="submit" class="w-full">Login</Button>
            <Button variant="outline" class="w-full">
                Login with Seed Phrase
            </Button>
        </Card.Footer>
    </Card.Root>
</div>
