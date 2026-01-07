# P-Wallet

A simply Ethereum HD (Hierarchical Deterministic Wallet) built as a desktop application. Project was built to apply content learnt from Mastering Ethereum. Try it out!

[![Watch the video](https://img.youtube.com/vi/yemi-DCQSS4/maxresdefault.jpg)](https://www.youtube.com/watch?v=yemi-DCQSS4)

## Features

- **HD Wallet Support**: Generate wallets using BIP-39/BIP-32/BIP-44 standards
- **Create or Import**: Generate new 12-word recovery phrases or import existing ones
- **Optional Passphrase**: Add an extra layer of security (25th word)
- **Encrypted Storage**: Wallets encrypted with AES-128-CTR (scrypt KDF) and stored locally
- **Password Recovery**: Reset your password using your recovery phrase
- **Balance Checking**: View your ETH balance on Ethereum mainnet
- **Send Transactions**: Transfer ETH with gas fee estimation
- **Self-Custodial**: All private keys generated and stored locally - never sent to any server

## Tech Stack

### Frontend
- **SvelteKit** - Web framework (Svelte 5 syntax)
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling (via shadcn-svelte components)
- **ethers.js v6** - Ethereum wallet and blockchain interactions

### Backend
- **Tauri** - Desktop application framework (Rust)
- **Rust** - Secure file system operations for encrypted wallet storage

### Build Tools
- **Bun** - Fast JavaScript runtime and package manager
- **Vite** - Build tool and dev server

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd p_wallet
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Run in development mode**
   ```bash
   bun run tauri dev
   ```

4. **Build for production**
   ```bash
   bun run tauri build
   ```

## Usage

### First Time Setup

1. **Launch the app**
   - On first run, you'll see options to create a new wallet or import an existing one

2. **Create New Wallet**
   - Click "Create New Wallet"
   - Set a strong encryption password (12+ characters, uppercase, lowercase, number, special character)
   - Optionally add a passphrase for extra security
   - **Write down your 12-word recovery phrase** and store it securely
   - Confirm you've saved it

3. **Import Existing Wallet**
   - Click "Import Existing Wallet"
   - Enter your 12-word recovery phrase
   - Enter your passphrase (if you had one)
   - Set a new encryption password for this device

### Daily Use

1. **Login**
   - Enter your encryption password to unlock your wallet

2. **View Balance**
   - Your ETH balance loads automatically from Ethereum mainnet
   - Click the refresh icon to update

3. **Send Transaction**
   - Click "Send"
   - Enter recipient address and amount
   - (Optional) Add data payload for smart contract interactions
   - Click "Review Transaction" to see gas fees
   - Click "Send Transaction" to broadcast

4. **Copy Address**
   - Click your shortened address to copy the full address to clipboard

### Password Recovery

If you forget your encryption password:

1. Click "Forgot your password?" on the login screen
2. Enter your 12-word recovery phrase
3. Enter your passphrase (if applicable)
4. Set a new encryption password
5. Your wallet will be re-encrypted with the new password

## Security

- **Client-Side Only**: All cryptographic operations happen in the browser/app
- **No Network Transmission**: Private keys and recovery phrases never leave your device
- **Encrypted Storage**: Wallets stored using Ethereum's standard keystore format
- **Recovery Phrase**: Your 12 words are the ultimate backup - store them securely offline

## File Locations

Encrypted wallet files are stored in:
- **Linux**: `~/.config/p-wallet/`
- **macOS**: `~/Library/Application Support/p-wallet/`
- **Windows**: `C:\Users\<User>\AppData\Roaming\p-wallet\`

Files:
- `wallet_keystore.json` - Encrypted wallet
- `wallet_address.txt` - Public address (for recovery verification)

## Project Structure

```
p_wallet/
├── src/
│   ├── lib/
│   │   ├── components/     # UI components
│   │   ├── stores/         # Svelte stores for state management
│   │   └── utils/          # Crypto & blockchain utilities
│   └── routes/             # SvelteKit pages
│       ├── create/         # New wallet creation flow
│       ├── import/         # Import wallet flow
│       ├── login/          # Login page
│       ├── recover/        # Password recovery flow
│       └── home/           # Main wallet dashboard
├── src-tauri/
│   └── src/
│       └── main.rs         # Rust backend for file operations
└── vite.config.ts          # Vite config with polyfills for crypto
```

## Development Notes

- **Node Polyfills Required**: The project uses `vite-plugin-node-polyfills` to support `Buffer` and crypto globals in the browser
- **Ethereum RPC**: Currently uses `https://eth.llamarpc.com` (can be changed in `src/lib/utils/blockchain.ts`)
- **Testnet Support**: To use testnets, update the `PROVIDER_URL` in `blockchain.ts`

## Disclaimer

I made this for fun, but use at your own risk!!!!
