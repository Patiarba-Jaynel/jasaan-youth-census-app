
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add CSS for the gradient background
const style = document.createElement('style');
style.textContent = `
  .gradient-bg {
    background: linear-gradient(135deg, #1B365D 0%, #D7262C 100%);
    color: white;
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
