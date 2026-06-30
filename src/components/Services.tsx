export function Services() {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto" id="service">
      <h2 className="text-center text-3xl font-medium mb-8">Services</h2>
      <div className="flex flex-row flex-wrap gap-5">
        <div className="bg-white p-8 flex-1 min-w-[250px] rounded-xl shadow-sm">
          <h3 className="mb-4 text-xl font-medium text-zinc-900">Plumbing</h3>
          <p className="text-sm text-zinc-600">Faucets, toilets, and leak repair.</p>
        </div>
        <div className="bg-white p-8 flex-1 min-w-[250px] rounded-xl shadow-sm">
          <h3 className="mb-4 text-xl font-medium text-zinc-900">Fences</h3>
          <p className="text-sm text-zinc-600">Wood and chain-link fence installation.</p>
        </div>
        <div className="bg-white p-8 flex-1 min-w-[250px] rounded-xl shadow-sm">
          <h3 className="mb-4 text-xl font-medium text-zinc-900">Remodeling</h3>
          <p className="text-sm text-zinc-600">Kitchen and bathroom updates.</p>
        </div>
      </div>
    </section>
  );
}