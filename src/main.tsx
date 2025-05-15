
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add CSS for the gradient background
const style = document.createElement('style');
style.textContent = `
  .gradient-bg {
    background: linear-gradient(135deg, #e53e3e 0%, #dd6b20 100%);
    color: white;
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
