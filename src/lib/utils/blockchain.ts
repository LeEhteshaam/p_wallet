import {ethers, HDNodeWallet} from 'ethers';

const PROVIDER_URL = "https://eth.llamarpc.com"; 
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);

export async function getBalance(address: string): Promise<string> {
    const balanceWei = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balanceWei);
    
    return balanceEth;
}

export async function estimateTransactionFee(
    fromAddress: string,
    toAddress: string,
    amountEth: string,
    dataPayload: string = "0x"
): Promise<string> {
    const amountWei = ethers.parseEther(amountEth);

    let gasLimit;
    try {
        gasLimit = await provider.estimateGas({
            from: fromAddress,
            to: toAddress,
            value: amountWei,
            data: dataPayload
        });
    } catch (error) {
        throw new Error("Gas estimation failed. The transaction is likely invalid or will revert.");
    }

    const feeData = await provider.getFeeData();
    const gasPrice = feeData.maxFeePerGas || feeData.gasPrice || BigInt(0);
    const estimatedFeeWei = gasLimit * gasPrice;
    
    return ethers.formatEther(estimatedFeeWei);
}

export async function sendUniversalTransaction(
    wallet: HDNodeWallet,
    toAddress: string,
    amountEth: string,
    dataPayload: string = "0x"
) {
    const connectedWallet = wallet.connect(provider);
    const amountWei = ethers.parseEther(amountEth);

    console.log("--- STARTING PRE-FLIGHT CHECKS ---");

    // 1. ESTIMATE GAS LIMIT (Re-calculating specifically for the tx object)
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
        // Formatting for readability
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
        data: dataPayload, 
        gasLimit: gasLimit 
    });

    console.log(`Transaction Sent! Hash: ${tx.hash}`);
    return tx;
}