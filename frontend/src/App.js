import './App.css';
import Home from './components/Home';
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <div className="App">
      <Analytics/>
      <Home/>
    </div>
  );
}

export default App;
