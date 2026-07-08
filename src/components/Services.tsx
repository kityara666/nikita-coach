export function Services() {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto" id="service">
      <h2 className="text-center text-3xl font-bold mb-12 text-zinc-50">Coaching Services</h2>
      <div className="flex flex-col md:flex-row flex-wrap gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-8 flex-1 min-w-64 rounded-xl shadow-lg">
          <h3 className="mb-4 text-xl font-bold text-violet-400">1-on-1 VOD Review</h3>
          <p className="text-sm text-zinc-400">Deep dive into your recent matches over Discord. I'll break down your decision-making, item builds, and positioning mistakes.</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-8 flex-1 min-w-64 rounded-xl shadow-lg">
          <h3 className="mb-4 text-xl font-bold text-violet-400">Draft & Strategy</h3>
          <p className="text-sm text-zinc-400">Learn how to counter-pick, build synergy, and understand the current meta. Win the game before the horn even sounds.</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-8 flex-1 min-w-64 rounded-xl shadow-lg">
          <h3 className="mb-4 text-xl font-bold text-violet-400">Mechanics & Laning</h3>
          <p className="text-sm text-zinc-400">Live coaching focused on creep aggro, trading hits, power spikes, and perfect last-hitting to secure the early game.</p>
        </div>
      </div>
    </section>
  );
}