import directorImg from "../director.png";

export function Hero() {
  return (
    <section className="min-h-[500px] flex items-center flex-col justify-center gap-5 mt-12 px-4 text-center">
      <h2 className="text-[40px] font-medium">Nikita</h2>
      <img src={directorImg} className="max-w-[400px] w-full h-auto" alt="Director" />
      <p className="text-[25px] font-light leading-relaxed">General contractor, Salinas area — fences to faucets</p>
      <a href="#projects-carousel" className="mt-4 no-underline text-blue-700 transition-all duration-200 bg-transparent rounded-full border-2 border-solid border-blue-700 py-5 px-8 inline-block hover:bg-blue-700 hover:text-white">Our work</a>
    </section>
  );
}