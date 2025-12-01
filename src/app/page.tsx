import { Navbar } from "@/components/navbar"
import { BuyCoverage } from "@/components/buy-coverage"
import { Dashboard } from "@/components/dashboard"
// import { AdminPanel } from "@/components/admin-panel"
import { PolicyProvider } from "@/context/policy"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      <div className="pt-16">
        <PolicyProvider>
          <BuyCoverage />
          <Dashboard />
          {/* <AdminPanel /> */}
        </PolicyProvider>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-sm text-muted-foreground">
        {/* Increased horizontal padding for better spacing on larger screens */}
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <p>© 2025 ShieldFI Protocol. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Docs
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
