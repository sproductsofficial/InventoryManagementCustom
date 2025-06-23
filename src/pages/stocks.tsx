import { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import Header from "../components/header";

export default function Stocks() {
  const [stocks, setStocks] = useState<{ name: string; unit: string; entryDate: string; value: number; lastUpdateDate?: string }[]>([]);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Quick Update Stock state
  const [updateStockName, setUpdateStockName] = useState('');
  const [updateStockValue, setUpdateStockValue] = useState('');
  const [updateWarning, setUpdateWarning] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Modal state for editing stock
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editStockIdx, setEditStockIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const storedStocks = JSON.parse(localStorage.getItem('stocks') || '[]');
    setStocks(storedStocks);
  }, []);

  // Helper: check if a date is today
  const isToday = (dateStr?: string) => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const addStock = () => {
    if (!name || !value || isNaN(Number(value))) return;
    const today = new Date().toISOString().split('T')[0];
    const newStock = { name, unit: '', entryDate: today, value: parseFloat(value), lastUpdateDate: today };
    const updatedStocks = [...stocks, newStock];
    setStocks(updatedStocks);
    localStorage.setItem('stocks', JSON.stringify(updatedStocks));
    setName('');
    setValue('');
  };

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

  // Open edit modal
  const openEditModal = (idx: number) => {
    setEditStockIdx(idx);
    setEditName(stocks[idx].name);
    setEditValue(stocks[idx].value.toString());
    setEditModalOpen(true);
  };

  // Save edit
  const saveEditStock = () => {
    if (editStockIdx === null || !editName.trim() || isNaN(Number(editValue))) return;
    const updatedStocks = [...stocks];
    updatedStocks[editStockIdx] = {
      ...updatedStocks[editStockIdx],
      name: editName,
      value: parseFloat(editValue)
    };
    setStocks(updatedStocks);
    localStorage.setItem('stocks', JSON.stringify(updatedStocks));
    setEditModalOpen(false);
  };

  // Remove stock
  const removeStock = (idx: number) => {
    if (!window.confirm('Are you sure you want to remove this stock item?')) return;
    const updatedStocks = stocks.filter((_, i) => i !== idx);
    setStocks(updatedStocks);
    localStorage.setItem('stocks', JSON.stringify(updatedStocks));
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

  const filteredStocks = stocks.filter(stock =>
    stock.name.toLowerCase().includes(search.toLowerCase())
  );
  const currentStocks = filteredStocks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-violet-50 dark:from-gray-950 dark:to-gray-900">
      <Header />
      <div className="mt-8 max-w-2xl mx-auto">
        <Card className="shadow-xl border-0 bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-amber-600 dark:text-amber-400">Quick Add Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-white" htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-white" htmlFor="value">Value (BDT)</Label>
              <Input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} required />
            </div>
            <Button onClick={addStock} className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg">Add Stock</Button>
          </CardContent>
        </Card>
      </div>
      {/* Quick Update Stock */}
      <div className="mt-8 max-w-2xl mx-auto">
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
      {/* Stock List Update Status */}
      <div className="mt-8 max-w-4xl mx-auto">
        <Card className="shadow-xl border-0 bg-white dark:bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-violet-600 dark:text-violet-400">Stock List</CardTitle>
            <div className="flex items-center gap-2">
              {allUpdatedToday ? (
                <span className="flex items-center gap-1 text-emerald-600 font-bold"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#10B981"/><path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Stock List Has been Updated today</span>
              ) : (
                <span className="flex items-center gap-1 text-rose-600 font-bold"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#EF4444"/><path d="M8 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Stock List Not Updated</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input id="search" placeholder="Search stocks..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-violet-100 dark:bg-violet-900">
                  <th className="p-2 text-left text-violet-700 dark:text-violet-300">Name</th>
                  <th className="p-2 text-left text-violet-700 dark:text-violet-300">Entry Date</th>
                  <th className="p-2 text-left text-violet-700 dark:text-violet-300">Value</th>
                  <th className="p-2 text-left text-violet-700 dark:text-violet-300">Last Update</th>
                  <th className="p-2 text-left text-violet-700 dark:text-violet-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStocks.map((stock, index) => (
                  <tr key={index} className="border-b border-violet-200 dark:border-violet-800">
                    <td className={`p-2 font-semibold rounded-l-lg ${isToday(stock.lastUpdateDate) ? 'bg-emerald-500 text-white' : 'text-white bg-violet-600'}`}>{stock.name}</td>
                    <td className="p-2 text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950">{stock.entryDate}</td>
                    <td className="p-2 font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">{stock.value} BDT</td>
                    <td className={`p-2 font-bold ${isToday(stock.lastUpdateDate) ? 'text-emerald-600' : 'text-rose-600'}`}>{stock.lastUpdateDate || '-'}</td>
                    <td className="p-2 flex gap-2">
                      <Button className="bg-sky-500 hover:bg-sky-600 text-white" onClick={() => openEditModal((currentPage - 1) * itemsPerPage + index)}>Update</Button>
                      <Button className="bg-rose-500 hover:bg-rose-600 text-white" onClick={() => removeStock((currentPage - 1) * itemsPerPage + index)}>Remove</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-center gap-2">
              <Button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="bg-violet-500 hover:bg-violet-600 text-white">Previous</Button>
              <Button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage * itemsPerPage >= filteredStocks.length} className="bg-violet-500 hover:bg-violet-600 text-white">Next</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Edit Stock Modal */}
      {editModalOpen && editStockIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-sm w-full p-6 relative">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-2 right-2 text-gray-400 hover:text-rose-500">✕</button>
            <h2 className="text-xl font-bold text-violet-700 dark:text-violet-300 mb-4">Edit Stock</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-900 dark:text-white">Name</Label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div>
                <Label className="text-gray-900 dark:text-white">Value (BDT)</Label>
                <Input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={saveEditStock}>Save</Button>
                <Button className="bg-gray-300 hover:bg-gray-400 text-gray-800" onClick={() => setEditModalOpen(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
