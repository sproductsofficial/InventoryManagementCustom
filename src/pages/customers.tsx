import { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Header from "../components/header";
import jsPDF from "jspdf";

type Customer = {
  id: string;
  name: string;
  contact: string;
  address: string;
  totalDue: number;
  totalDebt: number;
};

const toast = ({ title, description }: { title: string; description: string; variant?: string }) => {
  window.alert(`${title}\n${description}`);
};

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
      setCustomers(storedCustomers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load customers"
      });
    }
  }, []);

  // Load all transactions from localStorage
  useEffect(() => {
    try {
      const storedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
      setTransactions(storedTransactions);
    } catch (error) {
      // ignore
    }
  }, []);

  // Filter transactions for selected customer and date range
  useEffect(() => {
    if (!selectedCustomer) return;
    let txs = transactions.filter(
      (t) => t.customerId === selectedCustomer.id
    );
    if (dateFrom) {
      txs = txs.filter((t) => new Date(t.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      txs = txs.filter((t) => new Date(t.date) <= new Date(dateTo));
    }
    setFilteredTransactions(txs);
  }, [selectedCustomer, transactions, dateFrom, dateTo]);

  const validateInputs = () => {
    if (!customerName.trim()) {
      toast({
        title: "Error",
        description: "Name is required"
      });
      return false;
    }
    if (!contact.trim()) {
      toast({
        title: "Error",
        description: "Contact is required"
      });
      return false;
    }
    return true;
  };

  const addCustomer = () => {
    if (!validateInputs()) return;
    const customersList = JSON.parse(localStorage.getItem('customers') || '[]');
    if (customersList.some((c: any) => c.contact === contact.trim())) {
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
    try {
      const newCustomer = {
        id: crypto.randomUUID(),
        name: customerName,
        contact,
        address,
        totalDue: 0,
        totalDebt: 0
      };
      const updatedCustomers = [...customers, newCustomer];
      setCustomers(updatedCustomers);
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      setCustomerName('');
      setContact('');
      setAddress('');
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add customer"
      });
    }
  };

  const deleteCustomer = (id: string) => {
    setCustomerToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCustomer = () => {
    if (!customerToDelete) return;
    try {
      const newCustomers = customers.filter(customer => customer.id !== customerToDelete);
      setCustomers(newCustomers);
      localStorage.setItem('customers', JSON.stringify(newCustomers));
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      // Reset page if current page becomes empty
      if (currentPage > 1 && newCustomers.length <= (currentPage - 1) * itemsPerPage) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer"
      });
    } finally {
      setShowDeleteConfirm(false);
      setCustomerToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setCustomerToDelete(null);
  };

  const openModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
    const today = new Date().toISOString().split('T')[0];
    setDateTo(today);

    const customerTransactions = transactions.filter(t => t.customerId === customer.id);
    if (customerTransactions.length > 0) {
      const firstTransactionDate = customerTransactions.reduce((minDate, t) => {
        return new Date(t.date) < new Date(minDate) ? t.date : minDate;
      }, customerTransactions[0].date);
      setDateFrom(firstTransactionDate.slice(0, 10));
    } else {
      setDateFrom(''); // No transactions, so no start date
    }
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
    setDateFrom("");
    setDateTo("");
  };

  const exportPDF = () => {
    if (!selectedCustomer) return;
    const setupData = JSON.parse(localStorage.getItem('setupData') || '{}');
    const doc = new jsPDF();
    const margin = 22;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = margin;

    // Header: Shop Info
    doc.setFontSize(16);
    doc.text(setupData.shopName ? String(setupData.shopName) : '', margin, y);
    doc.setFontSize(10);
    doc.text(setupData.shopAddress ? String(setupData.shopAddress) : '', margin, y + 7);
    doc.text('Contact: ' + (setupData.contactNumber ? String(setupData.contactNumber) : ''), margin, y + 14);
    doc.text('Print Date: ' + new Date().toLocaleDateString(), pageWidth - margin, y, { align: 'right' });
    if (dateFrom && dateTo) {
      doc.text(`From: ${dateFrom} To: ${dateTo}`, pageWidth - margin, y + 7, { align: 'right' });
    }
    y += 22;

    // Customer info
    doc.setFontSize(13);
    doc.text(`Transaction History: ${selectedCustomer.name}`, margin, y);
    doc.setFontSize(10);
    doc.text(`Contact: ${selectedCustomer.contact}`, margin, y + 6);
    doc.text(`Address: ${selectedCustomer.address}`, margin, y + 12);
    y += 20;
    const boxY = y + 14;
    const boxHeight = 12;
    const boxWidth = 40;
    // Total Due box (red)
    doc.setFillColor(239, 68, 68); // Tailwind rose-600
    // White text
    doc.setTextColor(255,255,255);
    doc.rect(margin, boxY, boxWidth, boxHeight, 'F');
    doc.setFontSize(11);
    doc.text('Total Due', margin + 4, boxY + 5);
    doc.setFontSize(13);
    doc.text(`${selectedCustomer.totalDue} BDT`, margin + 4, boxY + 11);
    // Total Debt box (green)
    doc.setFillColor(16, 185, 129); // Tailwind emerald-500
    // White text
    const debtBoxX = margin + boxWidth + 10;
    doc.rect(debtBoxX, boxY, boxWidth, boxHeight, 'F');
    doc.setFontSize(11);
    doc.text('Total Debt', debtBoxX + 4, boxY + 5);
    doc.setFontSize(13);
    doc.text(`${selectedCustomer.totalDebt} BDT`, debtBoxX + 4, boxY + 11);
    doc.setTextColor(0,0,0);
    y = boxY + boxHeight + 6;

    // Table headers (English)
    doc.setFontSize(11);
    doc.setFillColor(33, 150, 243); // blue
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F');
    // Adjusted column positions for more space for Type
    doc.text('Date', margin + 2, y);
    doc.text('Type', margin + 32, y); // was 38
    doc.text('Amount', margin + 100, y); // was 80
    doc.text('Note', margin + 140, y); // was 120
    y += 7;
    doc.setTextColor(0, 0, 0);

    // Table rows
    filteredTransactions.forEach((t) => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      doc.text((t.date || '').slice(0, 10), margin + 2, y);
      doc.text(t.typeBn || t.type, margin + 32, y); // was 38
      doc.text(`${t.amount} BDT`, margin + 100, y); // was 80
      doc.text(t.note || '-', margin + 140, y); // was 120
      y += 7;
    });
    doc.save(`${selectedCustomer.name}_transactions.pdf`);
  };

  // Export customers to Excel (CSV)
  const exportCustomersToCSV = () => {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const rows = [
      ['Name', 'Contact', 'Total Due', 'Total Debt', 'Net Due/Debt'],
      ...customers.map((c: any) => {
        const net = (c.totalDue || 0) - (c.totalDebt || 0);
        let netLabel = net === 0 ? '0 BDT' : net > 0 ? `${net} BDT (Due)` : `${-net} BDT (Debt)`;
        return [c.name, c.contact, c.totalDue, c.totalDebt, netLabel];
      })
    ];
    const csvContent = rows.map(r => r.map((x: any) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase())
  );

  const currentCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-sky-50 dark:from-gray-950 dark:to-gray-900">
      <Header />
      <div className="mt-8 max-w-2xl mx-auto">
        <Card className="shadow-xl border-0 bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-rose-600 dark:text-rose-400">Quick Add Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-white" htmlFor="name">Name</Label>
              <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-white" htmlFor="contact">Contact</Label>
              <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-white" htmlFor="address">Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
            <Button onClick={addCustomer} className="w-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg">Add Customer</Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 max-w-4xl mx-auto">
        <Card className="shadow-xl border-0 bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-sky-600 dark:text-sky-400">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                id="search"
                placeholder="Search by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sky-100 dark:bg-sky-900">
                  <th className="p-2 text-left text-sky-700 dark:text-sky-300">Name</th>
                  <th className="p-2 text-left text-sky-700 dark:text-sky-300">Contact</th>
                  <th className="p-2 text-left text-sky-700 dark:text-sky-300">Total Due</th>
                  <th className="p-2 text-left text-sky-700 dark:text-sky-300">Total Debt</th>
                  <th className="p-2 text-left text-sky-700 dark:text-sky-300">Net Due/Debt</th>
                  <th className="p-2 text-left text-sky-700 dark:text-sky-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.map((customer) => {
                  const net = (customer.totalDue || 0) - (customer.totalDebt || 0);
                  let netLabel = net === 0 ? '0 BDT' : net > 0 ? `${net} BDT (Due)` : `${-net} BDT (Debt)`;
                  let netClass = net > 0
                    ? "p-2 font-bold bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300"
                    : net < 0
                      ? "p-2 font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                      : "p-2 font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
                  return (
                    <tr key={customer.id} className="border-b border-sky-200 dark:border-sky-800">
                      <td className="p-2 font-semibold text-black bg-sky-200 rounded-l-lg">{customer.name}</td>
                      <td className="p-2 text-black bg-sky-50 dark:bg-sky-950">{customer.contact}</td>
                      <td className="p-2 font-bold text-black bg-rose-100 dark:bg-rose-900">{customer.totalDue} BDT</td>
                      <td className="p-2 font-bold text-black bg-emerald-100 dark:bg-emerald-900">{customer.totalDebt} BDT</td>
                      <td className={netClass + ' text-black'}>{netLabel}</td>
                      <td className="p-2 bg-sky-50 dark:bg-sky-950 rounded-r-lg flex gap-2 text-white">
                        <Button variant="ghost" onClick={() => openModal(customer)} className="text-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900">View Transactions</Button>
                        <Button variant="destructive" onClick={() => deleteCustomer(customer.id)}>Delete</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-4 flex justify-center gap-2">
              <Button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="bg-sky-500 hover:bg-sky-600 text-white">Previous</Button>
              <Button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage * itemsPerPage >= filteredCustomers.length} className="bg-sky-500 hover:bg-sky-600 text-white">Next</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 max-w-4xl mx-auto flex justify-end">
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white mb-4" onClick={exportCustomersToCSV}>
          Export Customers to Excel
        </Button>
      </div>
      {/* Modal for viewing transactions */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full p-6 relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-400 hover:text-rose-500">✕</button>
            <h2 className="text-xl font-bold text-sky-700 dark:text-sky-300 mb-2">{selectedCustomer.name} - লেনদেন হিস্ত্রি</h2>
            <div className="flex gap-4 mb-4">
              <div>
                <Label htmlFor="dateFrom">শুরুর তারিখ</Label>
                <Input id="dateFrom" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="dateTo">শেষ তারিখ</Label>
                <Input id="dateTo" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
              <Button onClick={exportPDF} className="self-end bg-emerald-500 hover:bg-emerald-600 text-white">Download PDF</Button>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-xs border">
                <thead>
                  <tr className="bg-sky-100 dark:bg-sky-900">
                    <th className="p-2 text-gray-900 dark:text-white">তারিখ</th>
                    <th className="p-2 text-gray-900 dark:text-white">ধরন</th>
                    <th className="p-2 text-gray-900 dark:text-white">পরিমাণ</th>
                    <th className="p-2 text-gray-900 dark:text-white">বিবরণ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr><td colSpan={4} className="text-center p-4 text-gray-900 dark:text-white">কোনো লেনদেন নেই</td></tr>
                  ) : (
                    filteredTransactions.map((t, i) => (
                      <tr key={i} className="border-b border-sky-100 dark:border-sky-800">
                        <td className="p-2 text-gray-900 dark:text-white">{(t.date || "").slice(0, 10)}</td>
                        <td className="p-2 text-gray-900 dark:text-white">{t.typeBn || t.type}</td>
                        <td className="p-2 text-gray-900 dark:text-white">{t.amount} BDT</td>
                        <td className="p-2 text-gray-900 dark:text-white">{t.note || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Confirm Deletion</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">Are you sure you want to delete this customer? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <Button variant="ghost" onClick={cancelDelete}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteCustomer}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CustomerTable = ({ customers }: { customers: Customer[] }) => (
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Contact</th>
        <th>Address</th>
        <th>Total Due</th>
        <th>Total Debt</th>
        <th>Net Due/Debt</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {customers.map((customer) => (
        <tr key={customer.id}>
          <td>{customer.name}</td>
          <td>{customer.contact}</td>
          <td>{customer.address}</td>
          <td>{customer.totalDue}</td>
          <td>{customer.totalDebt}</td>
          <td>{customer.totalDue - customer.totalDebt}</td>
          <td>
            <Button onClick={() => openModal(customer)}>View</Button>
            <Button onClick={() => deleteCustomer(customer.id)}>Delete</Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const QuickAddCustomer = () => (
  <div>
    <Input
      placeholder="Name"
      value={customerName}
      onChange={(e) => setCustomerName(e.target.value)}
    />
    <Input
      placeholder="Contact"
      value={contact}
      onChange={(e) => setContact(e.target.value)}
    />
    <Input
      placeholder="Address"
      value={address}
      onChange={(e) => setAddress(e.target.value)}
    />
    <Button onClick={addCustomer}>Add Customer</Button>
  </div>
);
