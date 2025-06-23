import { useState } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function SetupPage() {
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    shopAddress: '',
    contactNumber: '',
    adminUsername: '',
    adminEmail: '',
    adminPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('setupData', JSON.stringify(formData));
    localStorage.setItem('isLoggedIn', 'true');
    window.location.href = '/login';
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8 bg-white dark:bg-black">
      <CardHeader>
        <CardTitle className="text-2xl">Setup Your Shop</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white" htmlFor="shopName">Shop Name</Label>
            <Input id="shopName" name="shopName" value={formData.shopName} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white" htmlFor="ownerName">Owner Name</Label>
            <Input id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white" htmlFor="shopAddress">Shop Address</Label>
            <Input id="shopAddress" name="shopAddress" value={formData.shopAddress} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white" htmlFor="contactNumber">Contact Number</Label>
            <Input id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white" htmlFor="adminUsername">Admin Username</Label>
            <Input id="adminUsername" name="adminUsername" value={formData.adminUsername} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white" htmlFor="adminEmail">Admin Email</Label>
            <Input id="adminEmail" name="adminEmail" type="email" value={formData.adminEmail} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white" htmlFor="adminPassword">Admin Password</Label>
            <Input id="adminPassword" name="adminPassword" type="password" value={formData.adminPassword} onChange={handleChange} required />
          </div>
          <Button variant="destructive" type="submit">Setup</Button>
        </form>
      </CardContent>
    </Card>
  );
}
