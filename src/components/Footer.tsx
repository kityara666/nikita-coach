export function Footer() {
  return (
    <footer className="bg-zinc-900 text-white">
      <section className="flex flex-col md:flex-row justify-between p-6 max-w-6xl mx-auto items-center gap-4" id="contact">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-medium mb-2">Contact Me</h2>
          <p className="mb-1">Telegram: <a href="https://t.me/skillbomja" className="hover:text-blue-500 transition-colors duration-200">Kityara</a></p>
          <p>Email: <a href="mailto:agartub2@gmail.com" className="hover:text-blue-500 transition-colors duration-200">agartub2@gmail.com</a></p>    
        </div>
        <div className="text-zinc-400 text-sm">
          <p>&copy; All rights reserved 2026</p>
        </div>
      </section>
    </footer>
  );
}