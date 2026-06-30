import logo from "../nikita-builds.png";

export function Header() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center p-4 md:p-10 gap-4 md:gap-0 sticky top-0 w-full box-border bg-white/85 backdrop-blur-md z-50">
      <section className="logo flex items-center gap-2.5">
        <img src={logo} alt="Nikita img" className="logo_img w-auto h-[60px]" />
      </section>
      <nav className="flex gap-2.5 md:gap-5 flex-wrap justify-center">
        <a href="#" className="no-underline text-blue-700 text-base md:text-xl inline-block py-2 px-4 md:py-2.5 md:px-5 bg-transparent rounded-full border-2 border-solid border-blue-700 transition-all duration-200 ease-in-out hover:bg-blue-700 hover:text-white">Home</a>
        <a href="#service" className="no-underline text-blue-700 text-base md:text-xl inline-block py-2 px-4 md:py-2.5 md:px-5 bg-transparent rounded-full border-2 border-solid border-blue-700 transition-all duration-200 ease-in-out hover:bg-blue-700 hover:text-white">Services</a>
        <a href="#contact" className="no-underline text-blue-700 text-base md:text-xl inline-block py-2 px-4 md:py-2.5 md:px-5 bg-transparent rounded-full border-2 border-solid border-blue-700 transition-all duration-200 ease-in-out hover:bg-blue-700 hover:text-white">Contact</a>
      </nav>
    </header>
  );
}