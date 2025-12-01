"use client"

import { useReducer, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShieldCheck, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Asset, RiskCategory } from "@/types"
import { useConnection } from "@/context/user"
import { Spinner } from "./ui/spinner"
import { usePolicy } from "@/context/policy"
import contractInteractions from "@/lib/connection_smart_contract"

export function BuyCoverage() {
  const [category, setCategory] = useState<RiskCategory>("Stablecoin")
  const [asset, setAsset] = useState<Asset>("USDC")
  const [amount, setAmount] = useState<number>(0)
  const [period, setPeriod] = useState<number>(0)
  const [isApproved, setIsApproved] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [premium, setPremium] = useState<number>(0)
  const {isConnected: walletConnected, signer} = useConnection();
  const { calculatePremium, setPolicies } = usePolicy();

  const handleApprove = async () => {
    if (!walletConnected || !signer) {
      console.warn("Please connect a wallet");
      throw new Error(`Warning: Please connect a wallet`);
    }

    setIsProcessing(true)
    try {
      await contractInteractions.shieldFI_token.approve(signer, premium+5);
      setIsApproved(true);
    } catch (error) {
      console.error(`${error instanceof Error ? error.message : "Something went wrong internally"}`);
      throw new Error("Couldn't approve the token action");
    } finally {
      setIsProcessing(false);
    }
  }

  const handlePurchase = async () => {
    if (!walletConnected || !signer) {
      console.warn("Please connect a wallet");
      throw new Error(`Warning: Please connect a wallet`);
    }

    setIsProcessing(true)
    try {
      await contractInteractions.shieldFI_main.purchasePolicy(signer, amount, period, asset == "DAI" ? 1 : asset == "USDC" ? 2 : 0, category == "Stablecoin" ? 1 : category == "Smart Contract" ? 2 : 3);
      const d = new Date();
      d.setDate((new Date()).getMonth() + period);
      setPolicies({ type: "create", payload: {
        id: Math.ceil(Math.random()*10).toString(),
        asset,
        amount,
        period, // days
        premium,
        startDate: Date.now(),
        expiryDate: Date.now() + (period * 24 * 60 * 60 * 1000),
        status: "Active",
      }});
      
      setIsApproved(false);
      setAmount(0);
      setPeriod(0);
    } catch (error) {
      console.error(`${error instanceof Error ? error.message : "Something went wrong internally"}`);
      throw new Error("Couldn't purchase policy");
    } finally {
      setIsProcessing(false);
    }
  }

  const calc_premium_deb = () => {
    let timeout: NodeJS.Timeout | null = null;

    return (risk_cat: number, stableCoin: number, period: number, coverage: number) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      if (!signer) {
        console.warn("Signer or provider not available");
        return;
      }

      timeout = setTimeout(() => {calculatePremium(risk_cat, stableCoin, period, coverage, signer).then((price) => setPremium(price))}, 200);
    }
  }

  const calculate_premium = calc_premium_deb();

  return (
    <section id="buy" className="py-12 md:py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />

      {/* Increased horizontal padding for better spacing on larger screens */}
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              Protocol Active & Secure
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              Decentralized <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                Coverage Protocol
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Protect your digital assets against depegs, smart contract failures, and liquidity risks. Instant
              coverage, transparent pricing.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">$12.5M</div>
                <div className="text-sm text-muted-foreground">Total Value Locked</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold text-secondary">$4.2M</div>
                <div className="text-sm text-muted-foreground">Active Coverage</div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 to-transparent rounded-2xl blur-lg opacity-50" />
            <Card className="glass-panel border-white/10 relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Get Coverage
                </CardTitle>
                <CardDescription>Calculate your premium and purchase instantly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Risk Category</Label>
                      <Select value={category} onValueChange={(v: RiskCategory) => {
                        setCategory(v);
                        // Recalculate premium on category change
                        const risk_cat_num = v === "Stablecoin" ? 1 : v === "Liquidity Pools" ? 2 : 0;
                        calculate_premium(risk_cat_num, asset === "USDC" ? 2 : asset === "DAI" ? 1 : 0, period, amount);
                      }}>
                        <SelectTrigger className="bg-black/20 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Stablecoin">Stablecoin Depeg</SelectItem>
                          <SelectItem value="Liquidity Pools">Liquidity Pools</SelectItem>
                          <SelectItem value="Smart Contract">Smart Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Asset to Cover</Label>
                      <Select value={asset} onValueChange={(v: Asset) => {
                        setAsset(v);

                        // Recalculate premium on asset change
                        const risk_cat_num = category === "Stablecoin" ? 1 : category === "Liquidity Pools" ? 2 : 0;
                        calculate_premium(risk_cat_num, v === "USDC" ? 2 : v === "DAI" ? 1 : 0, period, amount);
                      }}>
                        <SelectTrigger className="bg-black/20 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDC">USDC</SelectItem>
                          <SelectItem value="DAI">DAI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Coverage Amount (SHD)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setAmount(val);
                        }}
                        onBlur={(e) => {
                          // Recalculate premium on period change
                          const risk_cat_num = category === "Stablecoin" ? 1 : category === "Liquidity Pools" ? 2 : 0;
                          calculate_premium(risk_cat_num, asset === "USDC" ? 2 : asset === "DAI" ? 1 : 0, period, amount);
                        }}
                        className="bg-black/20 border-white/10 pr-16 font-mono"
                        placeholder="Enter amount in SHD"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                        SHD
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">You will be paid out in SHD if {asset} depegs.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (Days)</Label>
                    <Input
                      type="number"
                      value={period}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setPeriod(val);
                      }}
                      onBlur={(e) => {
                        // Recalculate premium on period change
                        const risk_cat_num = category === "Stablecoin" ? 1 : category === "Liquidity Pools" ? 2 : 0;
                        calculate_premium(risk_cat_num, asset === "USDC" ? 2 : asset === "DAI" ? 1 : 0, period, amount);
                      }}
                      className="bg-black/20 border-white/10 font-mono"
                    />
                  </div>
                </div>

                {/* Quote Display */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                  {/* <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Daily Rate</span>
                    <span className="font-mono text-primary">
                      {(state.riskData[asset].dailyRate * 100).toFixed(4)}%
                    </span>
                  </div> */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Coverage Duration</span>
                    <span className="font-mono text-white">{period} Days</span>
                  </div>
                  <div className="h-px bg-primary/20" />
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-white">One-time Premium</span>
                    <span className="text-xl font-bold text-primary font-mono">{premium.toFixed(4)} SHD</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className={cn(
                      "border-primary/20 hover:bg-primary/10 hover:text-primary",
                      isApproved && "bg-primary/10 text-primary border-primary/50",
                    )}
                    onClick={handleApprove}
                    disabled={isApproved || isProcessing || !walletConnected}
                  >
                    {isProcessing && !isApproved
                      ? <><Spinner /> Approving...</>
                      : isApproved
                        ? "Approved"
                        : `1. Approve ${premium.toFixed(2)} SHD`}
                    {isApproved && <CheckCircle2 className="w-4 h-4 ml-2" />}
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    onClick={handlePurchase}
                    disabled={!isApproved || isProcessing || !walletConnected}
                  >
                    {isProcessing && isApproved ? "Purchasing..." : "2. Purchase Policy"}
                    {!isProcessing && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>

                {!walletConnected && (
                  <div className="flex items-center gap-2 justify-center text-xs text-amber-500/80 bg-amber-500/10 p-2 rounded">
                    <AlertCircle className="w-3 h-3" />
                    Connect wallet to purchase coverage
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
