import "./index.css";
import "./styles.css";


import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Services } from "./components/Services";
import { Footer } from "./components/Footer";
import{ProjectCarousel} from "./components/Carousel"; 
import{ContactForm} from "./components/ContactForm.tsx"
import{Pricing} from "./components/Pricing.tsx"
import{Reviews} from "./components/Reviews.tsx"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubmissionsPage } from "./components/SubmissionsPage.tsx";

function HomePage() {
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
      <Pricing />
      <Reviews />
      <Footer />
    </div>
    </>
  );
}

export function App() {
  return (
  <BrowserRouter>
    <Routes>
      <Route>
        <Route path="/" element={<HomePage />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
  )
}

export default App;