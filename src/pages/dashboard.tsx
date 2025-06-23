import { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Header from "../components/header";
import { Link } from "react-router-dom";

const toast = ({ title, description }: { title: string; description: string; variant?: string }) => {
  window.alert(`${title}\n${description}`);
};

export default function Dashboard() {
  const [customerId, setCustomerId] = useState("");
  const [transactionType, setTransactionType] = useState('');
  const [amount, setAmount] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<{ id: string; name: string; contact: string; totalDue: number; totalDebt: number }[]>([]);
  const [stocks, setStocks] = useState<{ name: string; unit: string; entryDate: string; value: number; lastUpdateDate?: string }[]>([]);

  // Transaction log type
  const [transactions, setTransactions] = useState<{ customerId: string; name: string; type: string; amount: number; date: string }[]>(() => {
    return JSON.parse(localStorage.getItem('transactions') || '[]');
  });

  useEffect(() => {
    const setupData = JSON.parse(localStorage.getItem('setupData') || '{}');
    document.title = setupData.shopName || "Dashboard";
    const storedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
    const storedStocks = JSON.parse(localStorage.getItem('stocks') || '[]');
    setCustomers(storedCustomers);
    setStocks(storedStocks);
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      const storedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
      const storedStocks = JSON.parse(localStorage.getItem('stocks') || '[]');
      setCustomers(storedCustomers);
      setStocks(storedStocks);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleTransaction = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || !customerId || !transactionType) return;
    const today = new Date().toISOString().split('T')[0];
    let newTransactions = [...transactions];
    const customerObj = customers.find(c => c.id === customerId);
    if (!customerObj) return;
    let updatedCustomers = customers.map(c => {
      if (c.id === customerId) {
        let due = c.totalDue || 0;
        let debt = c.totalDebt || 0;
        let amt = parsedAmount;
        if (transactionType === 'Due') {
          if (debt > 0) {
            const offset = Math.min(debt, amt);
            if (offset > 0) {
              debt -= offset;
              amt -= offset;
              newTransactions.push({ customerId, name: c.name, type: 'Auto Adjusted: Paid from Debt', amount: offset, date: today });
            }
          }
          if (amt > 0) {
            due += amt;
            newTransactions.push({ customerId, name: c.name, type: 'Due', amount: amt, date: today });
          }
        } else if (transactionType === 'Payment') {
          if (due > 0) {
            const offset = Math.min(due, amt);
            if (offset > 0) {
              due -= offset;
              amt -= offset;
              newTransactions.push({ customerId, name: c.name, type: 'Payment', amount: offset, date: today });
            }
          }
          if (amt > 0) {
            debt -= amt;
            newTransactions.push({ customerId, name: c.name, type: 'Debt (Auto Overpay)', amount: amt, date: today });
          }
        } else if (transactionType === 'Debt') {
          if (due > 0) {
            const offset = Math.min(due, amt);
            if (offset > 0) {
              due -= offset;
              amt -= offset;
              newTransactions.push({ customerId, name: c.name, type: 'Auto Adjusted: Paid from Due', amount: offset, date: today });
            }
          }
          if (amt > 0) {
            debt += amt;
            newTransactions.push({ customerId, name: c.name, type: 'Debt', amount: amt, date: today });
          }
        } else if (transactionType === 'Debt Payment') {
          if (debt > 0) {
            const offset = Math.min(debt, amt);
            if (offset > 0) {
              debt -= offset;
              amt -= offset;
              newTransactions.push({ customerId, name: c.name, type: 'Debt Payment', amount: offset, date: today });
            }
          }
          if (amt > 0) {
            due -= amt;
            newTransactions.push({ customerId, name: c.name, type: 'Due (Auto Overpay)', amount: amt, date: today });
          }
        }
        // Prevent negative values
        return { ...c, totalDue: Math.max(0, due), totalDebt: Math.max(0, debt) };
      }
      return c;
    });
    setCustomers(updatedCustomers);
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    setTransactions(newTransactions);
    localStorage.setItem('transactions', JSON.stringify(newTransactions));
    setCustomerId('');
    setTransactionType('');
    setAmount('');
    setCustomerSearch('');
  };

  // Filter customers for dropdown
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Calculate totalDue and totalDebt from customers array (always up-to-date)
  const totalDue = customers.reduce((sum, c) => sum + (c.totalDue || 0), 0);
  const totalDebt = customers.reduce((sum, c) => sum + (c.totalDebt || 0), 0);

  // Calculate totalStock from stocks array
  const totalStock = stocks.reduce((sum, s) => sum + (typeof s.value === 'number' ? s.value : 0), 0);

  // Calculate totalCash as (Total Due + Total Stock) - Total Debt
  const totalCash = (totalDue + totalStock) - totalDebt;

  // Quick Add Stock form state
  const [stockName, setStockName] = useState('');
  const [stockValue, setStockValue] = useState('');

  // Add stock handler for dashboard
  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockName || !stockValue || isNaN(Number(stockValue))) return;
    const today = new Date().toISOString().split('T')[0];
    const newStock = { name: stockName, unit: '', entryDate: today, value: Number(stockValue), lastUpdateDate: today };
    const updatedStocks = [...stocks, newStock];
    setStocks(updatedStocks);
    localStorage.setItem('stocks', JSON.stringify(updatedStocks));
    setStockName('');
    setStockValue('');
  };

  // Quick Add Customer form state
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Add customer handler for dashboard
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerContact.trim()) {
      toast({
        title: "Error",
        description: "Name and Contact are required"
      });
      return;
    }

    const customersList = JSON.parse(localStorage.getItem('customers') || '[]');
    if (customersList.some((c: any) => c.contact === customerContact.trim())) {
      toast({
        title: "Duplicate Contact",
        description: "A customer with this contact number already exists."
      });
      return;
    }
    if (customersList.some((c: any) => c.name.toLowerCase() === customerName.trim().toLowerCase())) {
      toast({
        title: "Duplicate Name",
        description: "A customer with this name already exists. Please use a different name."
      });
      return;
    }

    const newCustomer = {
      id: crypto.randomUUID(),
      name: customerName,
      contact: customerContact,
      address: customerAddress,
      totalDue: 0,
      totalDebt: 0
    };
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    setCustomerName('');
    setCustomerContact('');
    setCustomerAddress('');
    toast({
      title: "Success",
      description: "Customer added successfully",
    });
  };

  // Sync customers/stocks on page focus or visibility change
  useEffect(() => {
    const syncData = () => {
      const storedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
      const storedStocks = JSON.parse(localStorage.getItem('stocks') || '[]');
      setCustomers(storedCustomers);
      setStocks(storedStocks);
    };
    window.addEventListener('focus', syncData);
    document.addEventListener('visibilitychange', syncData);
    return () => {
      window.removeEventListener('focus', syncData);
      document.removeEventListener('visibilitychange', syncData);
    };
  }, []);

  // --- Stock update logic for dashboard (copied from stocks.tsx) ---
  const [updateStockName, setUpdateStockName] = useState('');
  const [updateStockValue, setUpdateStockValue] = useState('');
  const [updateWarning, setUpdateWarning] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  // Helper: check if a date is today
  const isToday = (dateStr?: string) => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };
  // For dropdown: sort stocks so updated today go to bottom, and mark them
  const sortedStocks = [...stocks].sort((a, b) => {
    const aUpdated = isToday(a.lastUpdateDate);
    const bUpdated = isToday(b.lastUpdateDate);
    if (aUpdated === bUpdated) return 0;
    return aUpdated ? 1 : -1;
  });
  // For Stock List update status
  const totalStocks = stocks.length;
  const updatedTodayCount = stocks.filter(s => isToday(s.lastUpdateDate)).length;
  const allUpdatedToday = totalStocks > 0 && updatedTodayCount === totalStocks;
  // Quick Update Stock logic
  const handleUpdateStock = () => {
    setUpdateWarning('');
    setUpdateSuccess('');
    if (!updateStockName || !updateStockValue || isNaN(Number(updateStockValue))) return;
    const today = new Date().toISOString().split('T')[0];
    const idx = stocks.findIndex(s => s.name === updateStockName);
    if (idx === -1) return;
    if (isToday(stocks[idx].lastUpdateDate)) {
      setUpdateWarning('This stock item has already been updated today!');
      return;
    }
    const updatedStocks = [...stocks];
    updatedStocks[idx] = {
      ...updatedStocks[idx],
      value: parseFloat(updateStockValue),
      lastUpdateDate: today
    };
    setStocks(updatedStocks);
    localStorage.setItem('stocks', JSON.stringify(updatedStocks));
    setUpdateSuccess('Stock updated successfully!');
    setUpdateStockName('');
    setUpdateStockValue('');
  };

  // Patch: ensure all stocks have lastUpdateDate property for dashboard logic
  useEffect(() => {
    const storedStocks = JSON.parse(localStorage.getItem('stocks') || '[]');
    // Patch legacy stocks to add lastUpdateDate if missing
    const patchedStocks = storedStocks.map((s: any) => ({
      ...s,
      lastUpdateDate: s.lastUpdateDate || s.entryDate || '',
    }));
    setStocks(patchedStocks);
    // Optionally update localStorage to persist patch
    localStorage.setItem('stocks', JSON.stringify(patchedStocks));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-sky-50 dark:from-gray-950 dark:to-gray-900">
      <Header />
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 px-4">
        <Card className="bg-gradient-to-tr from-emerald-400 to-emerald-600 text-white shadow-2xl">
          <CardHeader>
            <CardTitle>Total Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalDue} BDT</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-sky-400 to-sky-600 text-white shadow-2xl">
          <CardHeader>
            <CardTitle>Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStock} BDT</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-rose-400 to-rose-600 text-white shadow-2xl">
          <CardHeader>
            <CardTitle>Total Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalDebt} BDT</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-violet-400 to-violet-600 text-white shadow-2xl">
          <CardHeader>
            <CardTitle>Total Cash</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCash} BDT</div>
          </CardContent>
        </Card>
      </div>
      {/* Quick Transaction Entry */}
      <div className="max-w-2xl mx-auto mt-10">
        <Card className="shadow-xl border-0 bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-emerald-600 dark:text-emerald-400">Quick Transaction Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={e => { e.preventDefault(); handleTransaction(); }}>
              <div>
                <Label className="text-gray-900 dark:text-white">Customer</Label>
                <div className="relative">
                  <Input
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    placeholder="Search customer"
                    className="mb-1"
                  />
                  <select
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm shadow-sm text-black dark:text-white"
                    value={customerId}
                    onChange={e => setCustomerId(e.target.value)}
                  >
                    <option value="">Select customer</option>
                    {filteredCustomers.map((c, i) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-gray-900 dark:text-white">Transaction Type</Label>
                <select
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm shadow-sm text-black dark:text-white"
                  value={transactionType}
                  onChange={e => setTransactionType(e.target.value)}
                >
                  <option value="">Select transaction type</option>
                  <option value="Due">Due (আমি পাব ক্রেতার থেকে - কাস্টমার বাকি নিলো)</option>
                  <option value="Payment">Payment (কাস্টমার তার বাকি পরিশোধ করল)</option>
                  <option value="Debt">Debt (ক্রেতা আমার কাছে পাবে - আমি বাকি নিলাম)</option>
                  <option value="Debt Payment">Debt Payment (কাস্টমার কে আমি তার পাওনা পরিশোধ করলাম)</option>
                </select>
              </div>
              <div>
                <Label className="text-gray-900 dark:text-white">Amount (BDT)</Label>
                <Input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (BDT)" />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg">Submit</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      {/* Customer Section: Overview (left) + Quick Add (right) */}
      <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Customer Overview (left) */}
        <div>
          <Card className="shadow-xl border-0 bg-white dark:bg-gray-900 h-full">
            <CardHeader>
              <CardTitle className="text-sky-600 dark:text-sky-400">Customer Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
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
                      const net = (c.totalDue || 0) - (c.totalDebt || 0);
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
                <div className="flex justify-end mt-2">
                  <Link to="/customers">
                    <Button className="bg-sky-500 hover:bg-sky-600 text-white shadow">View All Customers</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Quick Add Customer (right) */}
        <div>
          <Card className="shadow-xl border-0 bg-white dark:bg-gray-900 h-full">
            <CardHeader>
              <CardTitle className="text-rose-600 dark:text-rose-400">Quick Add Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    type="text"
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="customerContact">Contact</Label>
                  <Input
                    id="customerContact"
                    type="text"
                    placeholder="Contact Number"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="customerAddress">Address</Label>
                  <Input
                    id="customerAddress"
                    type="text"
                    placeholder="Customer Address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg">Add Customer</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Stock Section: Overview (left) + Quick Update (right) */}
      <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Stock Overview (left) */}
        <div>
          <Card className="shadow-xl border-0 bg-white dark:bg-gray-900 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-violet-600 dark:text-violet-400">Stock Overview</CardTitle>
              <div className="flex items-center gap-2">
                {allUpdatedToday ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-bold"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#10B981"/><path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Stock List Has been Updated today</span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-600 font-bold"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#EF4444"/><path d="M8 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Stock List Not Updated</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-violet-100 dark:bg-violet-900">
                      <th className="p-2 text-left text-violet-700 dark:text-violet-300">Name</th>
                      <th className="p-2 text-left text-violet-700 dark:text-violet-300">Value</th>
                      <th className="p-2 text-left text-violet-700 dark:text-violet-300">Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map((stock, i) => (
                      <tr key={i} className="border-b border-violet-200 dark:border-violet-800">
                        <td className={`p-2 font-semibold rounded-l-lg ${isToday(stock.lastUpdateDate) ? 'bg-emerald-500 text-white' : 'text-white bg-violet-600'}`}>{stock.name}</td>
                        <td className="p-2 font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">{stock.value} BDT</td>
                        <td className={`p-2 font-bold ${isToday(stock.lastUpdateDate) ? 'text-emerald-600' : 'text-rose-600'}`}>{stock.lastUpdateDate || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Quick Add/Update Stock (right) */}
        <div className="flex flex-col gap-8 h-full">
          {/* Quick Update Stock */}
          <Card className="shadow-xl border-0 bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-emerald-600 dark:text-emerald-400">Quick Update Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white" htmlFor="updateStock">Select Stock Item</Label>
                <select
                  id="updateStock"
                  value={updateStockName}
                  onChange={e => setUpdateStockName(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm shadow-sm text-black dark:text-white"
                >
                  <option value="">Select stock item</option>
                  {sortedStocks.map((s, i) => (
                    <option
                      key={s.name}
                      value={s.name}
                      className={isToday(s.lastUpdateDate) ? 'bg-emerald-500 text-white' : ''}
                    >
                      {s.name} {isToday(s.lastUpdateDate) ? '✓ (Updated today)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white" htmlFor="updateValue">Current Value (BDT)</Label>
                <Input id="updateValue" type="number" value={updateStockValue} onChange={e => setUpdateStockValue(e.target.value)} required />
              </div>
              <Button onClick={handleUpdateStock} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg">Update Stock</Button>
              {updateWarning && <div className="text-rose-600 font-bold mt-2">{updateWarning}</div>}
              {updateSuccess && <div className="text-emerald-600 font-bold mt-2">{updateSuccess}</div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
