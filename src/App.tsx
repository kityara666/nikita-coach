import "./index.css";

import logo from "./logo.svg";

export function App() {
  return (
    <div className="bg-red-500 p-4">
      Hello world!
      <img src={logo} className="w-12 h-12"/>
    </div>
  );
}

export default App;