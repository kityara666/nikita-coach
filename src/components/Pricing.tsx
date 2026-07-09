import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";



const plans = [
  { name: "Single Session", price: "$15", features: ["1 hour VOD review", "Written notes"], popular: false },
  { name: "Climb Package", price: "$50", features: ["4 sessions", "Draft help", "Discord follow-up"], popular: true },
  { name: "Pro Track", price: "$100", features: ["10 sessions", "Replay analysis", "Priority booking"], popular: false },
];

export function Pricing() {
  return (
    <section className="py-24 px-4 max-w-6xl mx-auto" id="pricing">
      <h2 className="text-3xl font-bold mb-12 text-center text-zinc-50">Choose your plan</h2>
      
      <div className="flex flex-col md:flex-row gap-6 justify-center">
        
    {plans.map((plan) => (
    <Card key={plan.name} className={`flex-1 flex flex-col bg-zinc-900 text-zinc-50 ${plan.popular ? 'border-2 border-violet-500 shadow-lg shadow-violet-500/20' : 'border border-zinc-800'}`}>
        <CardHeader>
            {plan.popular && <span className="text-violet-400 text-sm">Most popular</span>}
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <h2 className="text-3xl font-bold mb-4 text-violet-400">{plan.price}</h2>
        </CardHeader>
        
        <CardContent className="flex-1">
        <ul className="space-y-2">
            {plan.features.map((feature) => (
                <li key={feature} className="text-zinc-300">{feature}</li>
            ))}
        </ul>
        </CardContent>
        
        <div className="p-6 pt-0 mt-auto">
        <Button className="w-full bg-violet-600 hover:bg-violet-700">Choose plan</Button>
        </div>
    </Card>
    ))}
        
      </div>
    </section>
  );
}