import { Home, Users, Package, FileText, Sun, Moon } from "lucide-react";
import { Button } from "../components/ui/button";
import { useState } from "react";

export default function Header() {
  const setupData = JSON.parse(localStorage.getItem('setupData') || '{}');
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Toggle dark mode
  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  return (
    <header className="bg-gradient-to-r from-sky-500 to-emerald-500 dark:from-gray-900 dark:to-gray-800 text-white p-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center space-x-6">
        <div>
          <h1 className="text-2xl font-bold drop-shadow-lg flex items-center gap-2">
            <Home className="inline w-6 h-6 text-amber-300" />
            {setupData.shopName || 'MA Digital Center'}
          </h1>
          <div className="text-sm opacity-90">
            <p className="font-semibold tracking-wide">{setupData.ownerName || 'BABU MIA'}</p>
            <p>{setupData.shopAddress || 'Chilmari,Jorgach,Kurigram'}</p>
            <p>{setupData.contactNumber || '017177785638'}</p>
          </div>
        </div>
      </div>
      <nav className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" asChild className="text-white hover:bg-sky-600">
          <a href="/dashboard" className="flex items-center gap-1"><Home className="w-4 h-4" /> Home</a>
        </Button>
        <Button variant="ghost" asChild className="text-white hover:bg-rose-600">
          <a href="/customers" className="flex items-center gap-1"><Users className="w-4 h-4" /> Customer Management</a>
        </Button>
        <Button variant="ghost" asChild className="text-white hover:bg-emerald-600">
          <a href="/stocks" className="flex items-center gap-1"><Package className="w-4 h-4" /> Stock Management</a>
        </Button>
        <Button variant="ghost" asChild className="text-white hover:bg-violet-600">
          <a href="/logs" className="flex items-center gap-1"><FileText className="w-4 h-4" /> Logs & Reports</a>
        </Button>
        <Button variant="ghost" onClick={toggleTheme} className="ml-2 text-white hover:bg-amber-400">
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </nav>
    </header>
  );
}
