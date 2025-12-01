"use client"
import contractInteractions from "@/lib/connection_smart_contract";
import { Asset } from "@/types";
import { ethers } from "ethers";
import { ActionDispatch, createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useReducer, useState } from "react";
import { useConnection } from "./user";

export type PolicyType = {
    id: string
    asset: Asset
    amount: number
    period: number // days
    premium: number
    startDate: number
    expiryDate: number
    status: "Active" | "Expired" | "Claimed"
}

type PolicyContextType = {
    policies: PolicyType[],
    setPolicies: ActionDispatch<[action: PolicyActionType]>
    policyLoading: boolean,
    setPolicyLoading: Dispatch<SetStateAction<boolean>>
};

const initPolicyContextValue: PolicyContextType = {
    policies: [],
    setPolicies: () => { },
    policyLoading: false,
    setPolicyLoading: () => { }
};

const policyContext = createContext(initPolicyContextValue);

type PolicyActionType = { type: "delete", payload: { id: string } } | { type: "create", payload: PolicyType };

export const PolicyProvider = function ({ children }: { children: ReactNode }) {
    const [policyLoading, setPolicyLoading] = useState(false);
    const { signer, isConnected, provider } = useConnection();

    function policyReducer(state: PolicyType[], action: PolicyActionType): PolicyType[] {
        if (!isConnected || !signer || !provider) {
            throw new Error("Please connect a wallet");
        };

        setPolicyLoading(true);

        try {
            switch (action.type) {
                case "create":
                    return [...state, action.payload];
                case "delete":
                    return state.filter((val) => val.id != action.payload.id);
                default:
                    throw new Error(`Unsupported action type: ${(action as any).type}`);
            }
        } catch (error) {
            throw error;
        } finally {
            setPolicyLoading(false);
        }
    }
    const [policies, policyDispatch] = useReducer(policyReducer, []);

    useEffect(() => {
        // Fetch policies from blockchain or backend here and populate state
        async function fetchPolicies() {
            if (!isConnected || !signer || !provider) return;
            setPolicyLoading(true);
            try {
                (await contractInteractions.shieldFI_main.viewMyPolicies(signer)).forEach((p: any) => {
                    policyDispatch({ type: "create", payload: p });
                });
            } catch (error) {
                throw error;
            } finally {
                setPolicyLoading(false);
            }
        }
        fetchPolicies();
    }, [isConnected, signer, provider]);

    return (
        <policyContext.Provider value={{
            policies: policies,
            setPolicies: policyDispatch,
            policyLoading,
            setPolicyLoading
        }}>
            {children}
        </policyContext.Provider>
    )
}

export const usePolicy = function () {
    const state = useContext(policyContext);

    return {
        policies: state.policies,
        setPolicies: state.setPolicies,
        calculatePremium: async (risk_cat: number, stableCoin: number, period: number, coverage: number, signer: ethers.Signer | ethers.Provider): Promise<number> => {
            // Logic to calculate premium based on inputs
            console.log(`Calculating premium for risk_cat: ${risk_cat}, stableCoin: ${stableCoin}, period: ${period}, coverage: ${coverage}`);

            const price = await contractInteractions.shieldFI_main.getPolicyPrice(signer, coverage, period, stableCoin, risk_cat);

            return price; // Placeholder return value
        },
        isLoading: state.policyLoading,
    };
}