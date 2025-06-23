import { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Header from "../components/header";
import jsPDF from "jspdf";

export default function Logs() {
  const [logs, setLogs] = useState<{ type: string; amount: number; date: string }[]>([]);
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const storedLogs = JSON.parse(localStorage.getItem('logs') || '[]');
    setLogs(storedLogs);
  }, []);

  const addLog = () => {
    const today = new Date().toISOString().split('T')[0];
    const newLog = { type, amount: parseFloat(amount), date: today };
    setLogs([...logs, newLog]);
    localStorage.setItem('logs', JSON.stringify([...logs, newLog]));
    setType('');
    setAmount('');
  };

  const filteredLogs = logs.filter(log =>
    log.type.toLowerCase().includes(search.toLowerCase())
  );

  const currentLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- Dashboard summary logic ---
  const [customers, setCustomers] = useState<{ id: string; name: string; contact: string; totalDue: number; totalDebt: number }[]>([]);
  const [stocks, setStocks] = useState<{ name: string; unit: string; entryDate: string; value: number; lastUpdateDate?: string }[]>([]);
  useEffect(() => {
    const storedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
    setCustomers(storedCustomers);
    const storedStocks = JSON.parse(localStorage.getItem('stocks') || '[]');
    setStocks(storedStocks);
  }, []);
  // Calculate totals
  const totalDue = customers.reduce((sum, c) => sum + (c.totalDue || 0), 0);
  const totalDebt = customers.reduce((sum, c) => sum + (c.totalDebt || 0), 0);
  const totalStock = stocks.reduce((sum, s) => sum + (typeof s.value === 'number' ? s.value : 0), 0);
  const totalCash = (totalDue + totalStock) - totalDebt;
  // Net Due/Debt for each customer
  const getNet = (c: any) => (c.totalDue || 0) - (c.totalDebt || 0);
  // Today's updated stocks
  const today = new Date().toISOString().split('T')[0];
  const todaysStocks = stocks.filter(s => s.lastUpdateDate === today);
  // --- PDF Export ---
  const exportPDF = () => {
    const setupData = JSON.parse(localStorage.getItem('setupData') || '{}');
    // Use A4 landscape
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const margin = 18;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = margin;
    // Header: Shop Info (centered)
    doc.setFontSize(16);
    doc.text(setupData.shopName ? String(setupData.shopName) : '', pageWidth / 2, y, { align: 'center' });
    doc.setFontSize(10);
    doc.text(setupData.shopAddress ? String(setupData.shopAddress) : '', pageWidth / 2, y + 7, { align: 'center' });
    doc.text('Contact: ' + (setupData.contactNumber ? String(setupData.contactNumber) : ''), pageWidth / 2, y + 14, { align: 'center' });
    // Print date (right), Current Day Summary (left)
    doc.setFontSize(11);
    doc.text('Current Day Summary', margin, y + 24);
    doc.text('Print Date: ' + new Date().toLocaleDateString(), pageWidth - margin, y + 24, { align: 'right' });
    y += 32;
    // Summary values
    doc.setFontSize(11);
    doc.text(`Total Due: ${totalDue} BDT`, margin, y);
    doc.text(`Total Stock: ${totalStock} BDT`, margin, y + 7);
    doc.text(`Total Debt: ${totalDebt} BDT`, margin, y + 14);
    doc.text(`Total Cash: ${totalCash} BDT`, margin, y + 21);
    y += 28;
    // Customer List
    doc.setFontSize(13);
    doc.text('Customer List', margin, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFillColor(33, 150, 243);
    doc.setTextColor(255,255,255);
    doc.rect(margin, y-5, pageWidth-margin*2, 8, 'F');
    doc.text('Name', margin+2, y);
    doc.text('Contact', margin+40, y);
    doc.text('Total Due', margin+80, y);
    doc.text('Total Debt', margin+110, y);
    doc.text('Net Due/Debt', margin+145, y);
    y += 7;
    doc.setTextColor(0,0,0);
    customers.forEach(c => {
      if (y > 270) { doc.addPage(); y = margin; }
      doc.text(c.name, margin+2, y);
      doc.text(c.contact, margin+40, y);
      doc.text(`${c.totalDue} BDT`, margin+80, y);
      doc.text(`${c.totalDebt} BDT`, margin+110, y);
      const net = getNet(c);
      let netLabel = net === 0 ? '0 BDT' : net > 0 ? `${net} BDT (Due)` : `${-net} BDT (Debt)`;
      doc.text(netLabel, margin+145, y);
      y += 7;
    });
    y += 5;
    // Today's Updated Stock List
    doc.setFontSize(13);
    doc.text("Today's Updated Stock List", margin, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFillColor(16, 185, 129);
    doc.setTextColor(255,255,255);
    doc.rect(margin, y-5, pageWidth-margin*2, 8, 'F');
    doc.text('Name', margin+2, y);
    doc.text('Value', margin+60, y);
    y += 7;
    doc.setTextColor(0,0,0);
    todaysStocks.forEach(s => {
      if (y > 270) { doc.addPage(); y = margin; }
      doc.text(s.name, margin+2, y);
      doc.text(`${s.value} BDT`, margin+60, y);
      y += 7;
    });
    // Instead of save, open print dialog
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <div className="p-8">
      <Header />
      {/* Dashboard summary row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 mb-8">
        <Card className="bg-gradient-to-tr from-emerald-400 to-emerald-600 text-white shadow-2xl">
          <CardHeader><CardTitle>Total Due</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalDue} BDT</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-sky-400 to-sky-600 text-white shadow-2xl">
          <CardHeader><CardTitle>Total Stock</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalStock} BDT</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-rose-400 to-rose-600 text-white shadow-2xl">
          <CardHeader><CardTitle>Total Debt</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalDebt} BDT</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-violet-400 to-violet-600 text-white shadow-2xl">
          <CardHeader><CardTitle>Total Cash</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalCash} BDT</div></CardContent>
        </Card>
      </div>
      {/* Customer List */}
      <div className="mt-8">
        <Card>
          <CardHeader><CardTitle>Customer List</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-sky-100 dark:bg-sky-900">
                  <th className="p-2 text-left text-sky-700 dark:text-sky-300">Name</th>
                  <th className="p-2 text-left text-sky-700 dark:text-sky-300">Contact</th>
                  <th className="p-2 text-left text-sky-700 dark:text-sky-300">Total Due</th>
                  <th className="p-2 text-left text-sky-700 dark:text-sky-300">Total Debt</th>
                  <th className="p-2 text-left text-sky-700 dark:text-sky-300">Net Due/Debt</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => {
                  const net = getNet(c);
                  let netLabel = net === 0 ? '0 BDT' : net > 0 ? `${net} BDT (Due)` : `${-net} BDT (Debt)`;
                  let netClass = net > 0
                    ? "p-2 font-bold bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-r-lg"
                    : net < 0
                      ? "p-2 font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-r-lg"
                      : "p-2 font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-r-lg";
                  return (
                    <tr key={i} className="border-b border-sky-200 dark:border-sky-800">
                      <td className="p-2 font-semibold text-white bg-sky-600 rounded-l-lg">{c.name}</td>
                      <td className="p-2 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950">{c.contact}</td>
                      <td className="p-2 font-bold bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300">{c.totalDue} BDT</td>
                      <td className="p-2 font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">{c.totalDebt} BDT</td>
                      <td className={netClass}>{netLabel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
      {/* Today's Updated Stock List */}
      <div className="mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Updated Stock List</CardTitle>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={exportPDF}>Print PDF</Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-violet-100 dark:bg-violet-900">
                  <th className="p-2 text-left text-violet-700 dark:text-violet-300">Name</th>
                  <th className="p-2 text-left text-violet-700 dark:text-violet-300">Value</th>
                </tr>
              </thead>
              <tbody>
                {todaysStocks.map((s, i) => (
                  <tr key={i} className="border-b border-violet-200 dark:border-violet-800">
                    <td className="p-2 font-semibold text-white bg-violet-600 rounded-l-lg">{s.name}</td>
                    <td className="p-2 font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-r-lg">{s.value} BDT</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
