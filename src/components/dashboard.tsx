"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { useState } from "react"
import { Asset } from "@/types"
import { usePolicy } from "@/context/policy"
import { useConnection } from "@/context/user"
import { Spinner } from "./ui/spinner"

export interface Policy {
  id: string
  asset: Asset
  amount: number
  period: number // days
  premium: number
  startDate: number
  expiryDate: number
  status: "Active" | "Expired" | "Claimed"
}

export function Dashboard() {
  // const { state, dispatch } = useShield()
  const { policies, isLoading } = usePolicy();
  const { isConnected } = useConnection();

  const handleClaim = (policyId: string) => {
    if (confirm("Are you sure you want to submit a claim for this policy?")) {
      // dispatch({ type: "MAKE_CLAIM", payload: { policyId } })
    }
  }

  if (!isConnected) {
    return (
      <section id="dashboard" className="py-12 border-t border-white/5 bg-black/20">
        <div className="container mx-auto px-6 md:px-12 lg:px-20 text-center py-20">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-muted-foreground">Connect your wallet to view your active policies.</p>
        </div>
      </section>
    )
  }

  return (
    <section id="dashboard" className="py-12 border-t border-white/5 bg-black/20">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">My Policies</h2>
          <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
            {policies.length} Active
          </Badge>
        </div>

        {
          isLoading 
          ? <Spinner />
            : (policies.length === 0) ? (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
                <p className="text-muted-foreground">No active policies found.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {policies.map((policy) => (
                  <PolicyCard key={policy.id} policy={policy} onClaim={handleClaim} />
                ))}
              </div>
            )
        }
      </div>
    </section>
  )
}

function PolicyCard({ policy, onClaim }: { policy: Policy; onClaim: (id: string) => void }) {
  const isExpired = Date.now() > policy.expiryDate
  const daysLeft = Math.ceil((policy.expiryDate - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <Card className="glass-card group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/10">
              {policy.asset === "USDC" ? (
                <span className="font-bold text-blue-400 text-xs">USDC</span>
              ) : (
                <span className="font-bold text-yellow-400 text-xs">DAI</span>
              )}
            </div>
            <div>
              <CardTitle className="text-base">{policy.asset} Depeg Protection</CardTitle>
              <div className="text-xs text-muted-foreground font-mono">{policy.id}</div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              policy.status === "Active" && !isExpired
                ? "border-secondary/50 text-secondary bg-secondary/10"
                : policy.status === "Claimed"
                  ? "border-blue-500/50 text-blue-500 bg-blue-500/10"
                  : "border-white/10 text-muted-foreground"
            }
          >
            {policy.status === "Active" && isExpired ? "Expired" : policy.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 py-2">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Coverage</div>
            <div className="text-lg font-bold text-white">
              {policy.amount.toLocaleString()} {policy.asset}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Premium Paid</div>
            <div className="text-lg font-mono text-white">{parseFloat(policy.premium.toString()).toFixed(2)} SHD</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> Expires
            </span>
            <span className={daysLeft < 5 ? "text-red-400" : "text-white"}>
              {new Date(policy.expiryDate).toLocaleDateString()} ({daysLeft > 0 ? `${daysLeft} days left` : "Ended"})
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.max(0, Math.min(100, (1 - daysLeft / policy.period) * 100))}%` }}
            />
          </div>
        </div>

        <Button
          className="w-full mt-2 border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-colors bg-transparent"
          variant="outline"
          disabled={policy.status !== "Active" || isExpired}
          onClick={() => onClaim(policy.id)}
        >
          {policy.status === "Claimed" ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" /> Claim Processed
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 mr-2" /> Make Claim
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
