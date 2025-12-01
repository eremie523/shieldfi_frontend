"use client"

import { Shield, Wallet, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useConnection } from "@/context/user"
import { Spinner } from "@/components/ui/spinner"

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected, connectWallet: handleConnect, loading: isLoading, address: walletAddress, disconnectWallet, balance, signer, provider} = useConnection();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 border border-primary/50">
            <Shield className="w-5 h-5 text-primary" />
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Shield<span className="text-primary">FI</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#buy" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Buy Coverage
          </Link>
          <Link
            href="#dashboard"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            My Dashboard
          </Link>
          <Link href="#admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Admin
          </Link>
        </div>

        {/* Wallet Button */}
        <div className="hidden md:flex items-center gap-4">
          {
            isConnected && <div className="text-xs font-mono text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {balance.toFixed(2)} SHD
            </div>
          }
          <Button
            onClick={isConnected ? disconnectWallet : handleConnect}
            variant={isConnected ? "outline" : "default"}
            className={cn(
              "gap-2 transition-all duration-300",
              isConnected
                ? "border-primary/50 text-primary hover:bg-primary/10"
                : "bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]",
            )}
          >
            {
              isLoading 
              ? <><Spinner /> Loading...</> 
              : isConnected && walletAddress
                ? <>Disconnect {walletAddress.slice(0, 6)}...{walletAddress.slice(walletAddress.length - 4)}</>
                : <>
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </>
            }
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex gap-2 items-center">
          {
            isConnected && <div className="text-xs font-mono text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {balance.toFixed(2)} SHD
            </div>
          }
          <button
            className="p-2 text-muted-foreground hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
          <Link
            href="#buy"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Buy Coverage
          </Link>
          <Link
            href="#dashboard"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            My Dashboard
          </Link>
          <Link
            href="#admin"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Admin
          </Link>
          <Button
            onClick={handleConnect}
            variant={isConnected ? "outline" : "default"}
            className={cn(
              "gap-2 transition-all duration-300",
              isConnected
                ? "border-primary/50 text-primary hover:bg-primary/10"
                : "bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]",
            )}
          >
            {
              isLoading 
              ? <><Spinner /> Loading...</> 
              : isConnected && walletAddress
                ? <>Disconnect {walletAddress.slice(0, 6)}...{walletAddress.slice(walletAddress.length - 4)}</>
                : <>
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </>
            }
          </Button>
        </div>
      )}
    </nav>
  )
}
