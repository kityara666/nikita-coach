import "./index.css";
import "./styles.css";

import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Services } from "./components/Services";
import { Footer } from "./components/Footer";
import{Carousel} from "./components/Carousel"; 
import{ContactForm} from "./components/ContactForm.tsx"

export function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <ContactForm />
      </main>
      <Carousel />
      <Footer />
    </>
  );
}

export default App;