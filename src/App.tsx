import "./index.css";
import "./styles.css";


import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Services } from "./components/Services";
import { Footer } from "./components/Footer";
import{ProjectCarousel} from "./components/Carousel"; 
import{ContactForm} from "./components/ContactForm.tsx"

export function App() {
  return (
    <>
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <ContactForm />
      </main>
      <ProjectCarousel />
      <Footer />
    </div>
    </>
  );
}

export default App;