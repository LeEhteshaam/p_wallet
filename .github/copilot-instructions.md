# Project Context & Copilot Instructions

## 1. Project Overview
We are building a **Hierarchical Deterministic (HD) Ethereum Wallet** to apply knowledge from the book "Mastering Ethereum."
* **Goal:** A browser-based wallet that generates a mnemonic, derives keys (BIP-39/BIP-32/BIP-44), manages accounts, and simulates transactions.
* **Security Model:** Self-custodial. All private keys and mnemonics must be generated and stored **Client-Side Only**. Never send private keys to the SvelteKit server (SSR).

## 2. Tech Stack & Constraints
* **Runtime:** Bun
* **Framework:** SvelteKit (Svelte 5 syntax preferred if applicable, otherwise Svelte 4)
* **Language:** JavaScript (Strictly NO TypeScript)
* **Crypto Library:** `ethers` (Version 6.x)
* **Build Tool:** Vite (via SvelteKit)
* **Styling:** CSS or Tailwind (if installed), keep it simple.

## 3. Critical Dependencies
* `ethers`: For all cryptographic operations (HDNodeWallet, Mnemonic, signing).
* `vite-plugin-node-polyfills`: **MANDATORY.** Must be configured in `vite.config.js` to support Buffer/Process globals in the browser.

## 4. Project Structure
Strictly adhere to this file structure when generating code or suggesting new files.

```text
my-hd-wallet/
├── package.json
├── vite.config.js            <-- Polyfills configuration MUST exist here
├── svelte.config.js
├── static/
└── src/
    ├── lib/
    │   ├── components/       <-- Reusable UI components
    │   │   ├── MnemonicDisplay.svelte
    │   │   ├── AccountCard.svelte
    │   │   └── SendTransaction.svelte
    │   ├── stores/           <-- Svelte Stores for state management
    │   │   └── walletStore.js
    │   └── utils/            <-- Pure logic / Ethers.js wrappers
    │       ├── crypto.js     <-- ALL crypto logic (generate, derive, sign)
    │       └── formatters.js <-- formatting helpers (0x123...abc)
    └── routes/
        ├── +layout.svelte    <-- Global layout (Navbar/Connect status)
        └── +page.svelte      <-- Main dashboard