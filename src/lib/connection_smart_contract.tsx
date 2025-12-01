import { ethers, formatUnits, parseUnits } from "ethers"
import ShieldFI_ABI from "./abi/shieldfi_main.json";
import ShieldFI_Token_ABI from "./abi/shieldfi_token.json";
import DataFeed_ABI from "./abi/data_feed.json";
import TestDataFeed_ABI from "./abi/test_data_feed.json";
import ClaimQueue_ABI from "./abi/claim_queue.json";
import { PolicyType } from "@/context/policy";

const contracts = {
    "shieldFI_main": "0xCe45CEc167DB216E94071203bDb578E2C0ac09AE",
    "shieldFI_token": "0xF0B73986Dff2d047ecf05892DC2e111e078d9315",
    "data_feed": "0xc82C50757147bc86d3FAF1A1404299AF54cea6EF",
    "test_data_feed": "0xb804e683BAa80B4b669549c093c865aE1A196a10",
    "claim_queue": "0x0f4295a176201a9433e676aD72F52E79eEC29DBc",
    "policy_manager": "0x97004F3562Fe3Ec7f0957366Ba4517ed7dC41480",
}

const getContract = (name: keyof typeof contracts, provider: ethers.Signer | ethers.Provider) => {
    if (!provider) {
        throw new Error("Provider not initialized!");
    }

    let abi

    if (name === "shieldFI_main") {
        abi = ShieldFI_ABI;
    }
    else if (name === "shieldFI_token") {
        abi = ShieldFI_Token_ABI;
    }
    else if (name === "data_feed") {
        abi = DataFeed_ABI;
    }
    else if (name === "test_data_feed") {
        abi = TestDataFeed_ABI;
    }
    else if (name === "claim_queue") {
        abi = ClaimQueue_ABI;
    } else {
        throw new Error(`ABI for contract ${name} not found.`);
    };


    return new ethers.Contract(contracts[name], abi, provider);
}

const contractInteractions = {
    shieldFI_main: {
        // Read
        getPoliciesToMappedIndex: async (provider: ethers.Signer | ethers.Provider) => {
            const contract = getContract("shieldFI_main", provider);
            // return await contract.
        },
        getAllowedStableCoinsToMappedIndex: async (provider: ethers.Signer | ethers.Provider) => {
            const contract = getContract("shieldFI_main", provider);
            // return await contract.
        },
        getPolicyPrice: async (provider: ethers.Signer | ethers.Provider, coverageAmount: number, coveragePeriod: number, stableCoin: number, risk_cat: number) => {
            const contract = getContract("shieldFI_main", provider);
            const decimals = await contractInteractions.shieldFI_token.decimals(provider);
            const resp = await contract.getPremiumForPolicy(stableCoin, risk_cat, parseUnits(coverageAmount.toString(), 16), coveragePeriod * 24 * 60 * 60 * 1000);

            const formattedBalance = formatUnits(resp, decimals);

            return parseFloat(formattedBalance);
        },
        viewMyPolicies: async (provider: ethers.Signer | ethers.Provider) => {
            const contract = getContract("shieldFI_main", provider);
            const res = await contract.viewMyPolicies();

            console.log(res);

            // 2. Map the raw array of tuples/structs into clean objects
            const cleanPolicies: PolicyType[] = res.map((policy: any) => {
                // Each 'policy' here is the inner Proxy(Result) containing the 13 fields.

                // --- Accessing by Index (The safest method) ---
                // id: string
                //     asset: Asset
                //     amount: number
                //     period: number // days
                //     premium: number
                //     startDate: number
                //     expiryDate: number
                //     status: "Active" | "Expired" | "Claimed"

                console.log(Number(policy[6]));
                return {
                    id: Number(policy[0]), // BigInt
                    period: Number(policy[5]) / (1000 * 60 * 60 * 24), // BigInt

                    // You'll need to map the enum value (BigInt) to a string yourself
                    // status: Number(policy[6]) === 0 ? "ACTIVE" : "EXPIRED/CLAIMED",
                    status: "Active",

                    // Start/End times are BigInt timestamps, convert to JS Date for display
                    startTime: new Date(Number(policy[9]) * 1000),
                    expiryDate: new Date((Number(policy[9]) * 1000) + Number(policy[5])), // Assuming period is in days for example

                    // Use ethers.formatUnits for token amounts (assuming 18 decimals)
                    amount: ethers.formatUnits(policy[2], 16),
                    premium: ethers.formatUnits(policy[3], 18),
                    asset: "USDC", // Placeholder, map the stableCoin index to actual asset name as needed
                };
            });

            console.log(cleanPolicies);

            return cleanPolicies;
        },

        viewMyClaims: async (provider: ethers.Signer | ethers.Provider) => {
            const contract = getContract("shieldFI_main", provider);
            return await contract.viewMyClaims();
        },

        // Write
        purchasePolicy: async (provider: ethers.Signer | ethers.Provider, coverageAmount: number, coveragePeriod: number, stableCoin: number, risk_cat: number) => {
            const contract = getContract("shieldFI_main", provider);
            const tx = await contract.purchasePolicy(risk_cat, stableCoin, parseUnits(coverageAmount.toString(), 16), coveragePeriod * 24 * 60 * 60 * 1000);

            await tx.wait();

            console.log(tx);

            return tx;
        },

        makeClaim: async (provider: ethers.Signer | ethers.Provider, policyID: number, claimAmount: number, reason: string) => {
            const contract = getContract("shieldFI_main", provider);
            const tx = await contract.makeClaim(policyID);

            await tx.wait();

            return tx;
        }
    },

    shieldFI_token: {
        // Read
        balanceOf: async (provider: ethers.Signer | ethers.Provider, address: string) => {
            console.log(provider, address);
            const contract = getContract("shieldFI_token", provider);
            const resp = await contract.balanceOf(address);

            const decimals = await contract.decimals();

            const formattedBalance = formatUnits(resp, decimals);

            return parseFloat(formattedBalance);
        },
        decimals: async (provider: ethers.Signer | ethers.Provider) => {
            const contract = getContract("shieldFI_token", provider);
            return await contract.decimals();
        },
        allowance: async (provider: ethers.Signer | ethers.Provider, owner: string, spender: string) => {
            const contract = getContract("shieldFI_token", provider);
            return await contract.allowance(owner, spender);
        },

        // Write
        approve: async (provider: ethers.Signer | ethers.Provider, amount: number, spender: string = contracts.shieldFI_main) => {
            const contract = getContract("shieldFI_token", provider);
            const tx = await contract.approve(spender, parseUnits(amount.toString(), await contractInteractions.shieldFI_token.decimals(provider)));

            await tx.wait();
            console.log("Approval transaction:", tx.hash);

            return tx;
        },
        transfer: async (provider: ethers.Signer | ethers.Provider, to: string, amount: ethers.BigNumberish) => {
            const contract = getContract("shieldFI_token", provider);
            const tx = await contract.transfer(to, amount);

            await tx.wait();

            return tx;
        },
    },

    data_feed: {
        // Read
        getDevEnv: async (provider: ethers.Signer | ethers.Provider) => {
            const contract = getContract("data_feed", provider);
            return await contract.getDevEnv();
        },

        // Write
        toggleDevEnv: async (provider: ethers.Signer | ethers.Provider, devEnv: boolean) => {
            const contract = getContract("data_feed", provider);
            const tx = await contract.setDevEnv(devEnv);
            await tx.wait();
            return tx;
        }
    },

    test_data_feed: {
        // Read
        updatePrice: async (provider: ethers.Signer | ethers.Provider) => {
            const contract = getContract("test_data_feed", provider);
            return await contract.getLatestPrice();
        }
    },

    claim_queue: {
        // Read
        getClaim: async (provider: ethers.Signer | ethers.Provider, claimID: number) => {
            const contract = getContract("claim_queue", provider);
            return await contract.getClaim(claimID);
        }
    },
}

export default contractInteractions;