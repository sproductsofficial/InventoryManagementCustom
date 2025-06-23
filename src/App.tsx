import React from 'react';
import Header from './components/header';
import { Toaster } from "./components/ui/toaster";

const App: React.FC = () => {
  return (
    <>
      <div className="App">
        <Header />
        <main className="p-8">
          {/* Main content will be rendered by React Router */}
        </main>
      </div>
      <Toaster />
    </>
  );
};

export default App;

const APP_VERSION = '1.0.0';

function App() {
  useEffect(() => {
    const storedVersion = localStorage.getItem('app_version');
    
    if (storedVersion !== APP_VERSION) {
      localStorage.clear();
      localStorage.setItem('app_version', APP_VERSION);
    }
  }, []);
}
