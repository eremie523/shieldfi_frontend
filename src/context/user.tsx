"use client"
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react"
import { ethers } from "ethers";
import contractInteractions from "@/lib/connection_smart_contract";

type UserContextType = {
    address: string | null,
    setAddress: Dispatch<SetStateAction<string | null>>,
    isConnected: boolean,
    setIsConnected: Dispatch<SetStateAction<boolean>>,
    balance: number,
    setBalance: Dispatch<SetStateAction<number>>,
    loading: boolean,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
    provider: ethers.Provider | null,
    setProvider: Dispatch<SetStateAction<ethers.Provider | null>>,
    signer: ethers.Signer | null,
    setSigner: Dispatch<SetStateAction<ethers.Signer | null>>,
}

const userContextValue: UserContextType = {
    address: null,
    setAddress: () => { },
    isConnected: false,
    setIsConnected: () => { },
    balance: 0,
    setBalance: () => { },
    loading: false,
    setIsLoading: () => { },
    provider: null,
    setProvider: () => { },
    signer: null,
    setSigner: () => { }
}

const UserContext = createContext(userContextValue);
const UserContextProvider = UserContext.Provider;

const ConnectionProvider = (props: { children: ReactNode }) => {
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<number>(0);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [provider, setProvider] = useState<ethers.Provider | null>(null);

    useEffect(() => {
        if(!signer || !provider) return;

        provider.getNetwork().then((network) => { 
            console.log("Connected to network:", network);
        });

        signer.getAddress().then(async (address) => {
        setBalance(await contractInteractions.shieldFI_token.balanceOf(signer, address));
        })
    }, [signer, provider])

    return (
        <UserContextProvider value={{
            address,
            setAddress,
            isConnected,
            setIsConnected,
            balance,
            setBalance,
            setIsLoading,
            loading: isLoading,
            signer,
            provider,
            setProvider,
            setSigner
        }}>
            {props.children}
        </UserContextProvider>
    )
}

const useConnection = function () {
    const {
        isConnected,
        setIsConnected,
        address,
        setAddress,
        balance,
        setBalance,
        loading,
        setIsLoading,
        setSigner,
        setProvider,
        signer,
        provider
    } = useContext(UserContext);

    /**
     * Connects the user's wallet using the injected provider (e.g., MetaMask).
     * @returns {Promise<{provider: ethers.BrowserProvider, signer: ethers.Signer, address: string}>}
     */
    async function connectWallet() {
        if (typeof window.ethereum === 'undefined') {
            // Handle the case where the wallet extension is not installed
            alert("Please install MetaMask or another compatible Ethereum wallet to connect.");
            throw new Error("No EIP-1193 provider found (window.ethereum is undefined).");
        }

        setIsLoading(true);
        try {
            // 1. Create the Provider: BrowserProvider wraps the injected window.ethereum object.
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }],
            });

            const provider = new ethers.BrowserProvider(window.ethereum, "sepolia");

            // 2. Request Accounts: This prompts the user's wallet to connect/authorize your dApp.
            // This is equivalent to provider.send("eth_requestAccounts", []) in v5.
            // It's often handled implicitly by .getSigner(), but explicitly calling it first is safer.
            await provider.send("eth_requestAccounts", []);

            // 3. Get the Signer: The Signer represents the connected user's account and key.
            const signer = await provider.getSigner();

            // 4. Get the Address: Use the Signer to get the primary address.
            const address = await signer.getAddress();

            setIsConnected(true);
            setAddress(address);
            setBalance(100);
            setSigner(signer);
            setProvider(provider);
        } catch (error) {
            // Handle user rejection, RPC errors, etc.
            console.error("Wallet connection failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    function disconnectWallet() {
        setIsLoading(true);

        try {
            setSigner(null);
            setProvider(null);
            setAddress(null);
            setIsConnected(false);
            setBalance(0);
        } catch (error) {
          throw new Error(`Error: ${error instanceof Error ? error.message : "Something went wrong"}`); 
        } finally {
            setIsLoading(false);
        }
    }

    function updateBalance() {

    }

    return {
        connectWallet,
        disconnectWallet,
        updateBalance,
        address,
        loading,
        balance,
        isConnected,
        signer,
        provider
    }
}

export {
    ConnectionProvider,
    useConnection
}