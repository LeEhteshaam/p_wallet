import {ethers, HDNodeWallet} from 'ethers';

const PROVIDER_URL = "https://eth.llamarpc.com"; 
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);

export async function getBalance(address: string): Promise<string> {
    // Get balance (returns a BigInt in "Wei")
    const balanceWei = await provider.getBalance(address);
    
    // Convert to readable string (e.g., "1.5")
    const balanceEth = ethers.formatEther(balanceWei);
    
    return balanceEth;
}

export async function sendUniversalTransaction(
    wallet: HDNodeWallet,
    toAddress: string,
    amountEth: string,
    dataPayload: string = "0x" // Default to "0x" (Empty) for simple transfers
) {
    const connectedWallet = wallet.connect(provider);
    const amountWei = ethers.parseEther(amountEth);

    console.log("--- STARTING PRE-FLIGHT CHECKS ---");

    // 1. ESTIMATE GAS (Crucial for Contracts)
    // If we are calling a complex contract function, this number will be higher than 21,000
    let gasLimit;
    try {
        gasLimit = await connectedWallet.estimateGas({
            to: toAddress,
            value: amountWei,
            data: dataPayload 
        });
    } catch (error) {
        throw new Error("Gas estimation failed. The transaction is likely invalid or will revert.");
    }

    // 2. GET CURRENT GAS PRICE
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.maxFeePerGas || feeData.gasPrice || BigInt(0);

    // 3. CALCULATE TOTAL COST
    const estimatedFee = gasLimit * gasPrice;
    const totalCost = amountWei + estimatedFee;

    // 4. CHECK SOLVENCY (The Safety Switch)
    const balance = await provider.getBalance(wallet.address);

    if (balance < totalCost) {
        // Formating for readability
        const missing = ethers.formatEther(totalCost - balance);
        throw new Error(
            `Insufficient Funds. You have ${ethers.formatEther(balance)} ETH, ` +
            `but need ${ethers.formatEther(totalCost)} ETH (Value + Gas). ` +
            `Short by: ${missing} ETH`
        );
    }

    console.log("Checks Passed. Sending...");

    // 5. SEND THE TRANSACTION
    const tx = await connectedWallet.sendTransaction({
        to: toAddress,
        value: amountWei,
        data: dataPayload, // <--- This allows smart contract interaction
        gasLimit: gasLimit // explicitly setting the limit we calculated
    });

    console.log(`Transaction Sent! Hash: ${tx.hash}`);
    return tx;
}

