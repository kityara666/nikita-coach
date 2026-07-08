import logo from "../img/logo-img.png";

export function Header() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center p-4 md:p-10 gap-4 md:gap-0 sticky top-0 w-full box-border bg-zinc-950/80 backdrop-blur-md z-50 border-b border-zinc-800">
      <section className="logo flex items-center gap-2">
        <img src={logo} alt="Nikita The Coach Logo" className="w-auto h-16 rounded bg-violet-600" />
        <span className="font-bold text-xl tracking-tight text-zinc-50">Nikita The Coach</span>
      </section>
      <nav className="flex gap-2 md:gap-5 flex-wrap justify-center">
        <a href="#" className="no-underline text-violet-400 text-base md:text-xl inline-block py-2 px-4 md:py-2 md:px-5 bg-transparent rounded-full border-2 border-solid border-violet-600 transition-all duration-200 hover:bg-violet-600 hover:text-white">Home</a>
        <a href="#service" className="no-underline text-violet-400 text-base md:text-xl inline-block py-2 px-4 md:py-2 md:px-5 bg-transparent rounded-full border-2 border-solid border-violet-600 transition-all duration-200 hover:bg-violet-600 hover:text-white">Services</a>
        <a href="#contact" className="no-underline text-violet-400 text-base md:text-xl inline-block py-2 px-4 md:py-2 md:px-5 bg-transparent rounded-full border-2 border-solid border-violet-600 transition-all duration-200 hover:bg-violet-600 hover:text-white">Contact</a>
      </nav>
    </header>
  );
}