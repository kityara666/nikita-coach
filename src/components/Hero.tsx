import profileImg from "../img/nikita-account.png";

export function Hero() {
  return (
    <section className="py-24 md:py-32 flex items-center flex-col justify-center gap-5 px-4 text-center">
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-50">
        Nikita The Coach
      </h1>
      <img src={profileImg} className="max-w-md w-full h-auto rounded-lg shadow-2xl border border-zinc-800 object-cover" alt="Nikita - Dota 2 Coach" />
      <p className="text-2xl font-light leading-relaxed text-zinc-300 max-w-2xl">
        Immortal-rank Dota 2 coach — <span className="text-violet-400 font-medium">climb the ranks with me.</span>
      </p>
      <a href="#" className="mt-4 no-underline text-zinc-50 transition-all duration-200 bg-violet-600 rounded-full border-2 border-solid border-violet-600 py-4 px-8 inline-block hover:bg-violet-700 hover:border-violet-700 font-medium">
        See Gameplay
      </a>
    </section>
  );
}