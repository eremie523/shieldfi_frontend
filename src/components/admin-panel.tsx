// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { ChevronDown, ChevronUp, Settings, RefreshCw, Download } from "lucide-react"
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// export function AdminPanel() {
//   const { state, dispatch } = useShield()
//   const [isOpen, setIsOpen] = useState(false)
//   const [usdcRate, setUsdcRate] = useState((state.riskData.USDC.apy * 100).toString())
//   const [daiRate, setDaiRate] = useState((state.riskData.DAI.apy * 100).toString())

//   const handleUpdate = () => {
//     dispatch({
//       type: "UPDATE_RISK_DATA",
//       payload: { asset: "USDC", apy: Number.parseFloat(usdcRate) / 100 },
//     })
//     dispatch({
//       type: "UPDATE_RISK_DATA",
//       payload: { asset: "DAI", apy: Number.parseFloat(daiRate) / 100 },
//     })
//   }

//   return (
//     <section id="admin" className="py-12 container mx-auto px-6 md:px-12 lg:px-20">
//       <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full space-y-2">
//         <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 border border-white/10">
//           <div className="flex items-center gap-2 text-muted-foreground">
//             <Settings className="w-4 h-4" />
//             <span className="text-sm font-medium">Admin Controls</span>
//           </div>
//           <CollapsibleTrigger asChild>
//             <Button variant="ghost" size="sm" className="w-9 p-0">
//               {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
//               <span className="sr-only">Toggle</span>
//             </Button>
//           </CollapsibleTrigger>
//         </div>

//         <CollapsibleContent className="space-y-4 animate-in slide-in-from-top-5 fade-in duration-300">
//           <Card className="glass-panel border-white/10">
//             <CardHeader>
//               <CardTitle className="text-lg">Risk Parameters</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div className="space-y-4 p-4 rounded-lg bg-black/20 border border-white/5">
//                   <h3 className="font-medium text-blue-400">USDC Pool</h3>
//                   <div className="space-y-2">
//                     <Label>Daily Premium Rate (%)</Label>
//                     <Input
//                       type="number"
//                       value={usdcRate}
//                       onChange={(e) => setUsdcRate(e.target.value)}
//                       className="bg-black/40 border-white/10"
//                     />
//                   </div>
//                   <div className="flex justify-between text-sm text-muted-foreground">
//                     <span>Capacity:</span>
//                     <span>{(state.riskData.USDC.capacity / 1000000).toFixed(1)}M USDC</span>
//                   </div>
//                 </div>

//                 <div className="space-y-4 p-4 rounded-lg bg-black/20 border border-white/5">
//                   <h3 className="font-medium text-yellow-400">DAI Pool</h3>
//                   <div className="space-y-2">
//                     <Label>Daily Premium Rate (%)</Label>
//                     <Input
//                       type="number"
//                       value={daiRate}
//                       onChange={(e) => setDaiRate(e.target.value)}
//                       className="bg-black/40 border-white/10"
//                     />
//                   </div>
//                   <div className="flex justify-between text-sm text-muted-foreground">
//                     <span>Capacity:</span>
//                     <span>{(state.riskData.DAI.capacity / 1000000).toFixed(1)}M DAI</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex gap-4 mt-6">
//                 <Button
//                   onClick={handleUpdate}
//                   className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20"
//                 >
//                   <RefreshCw className="w-4 h-4 mr-2" /> Update Feed
//                 </Button>
//                 <Button variant="outline" className="border-white/10 hover:bg-white/5 bg-transparent">
//                   <Download className="w-4 h-4 mr-2" /> Withdraw Pool Funds
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </CollapsibleContent>
//       </Collapsible>
//     </section>
//   )
// }
