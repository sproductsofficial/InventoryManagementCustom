import { useState } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const setupData = JSON.parse(localStorage.getItem('setupData') || '{}');
    if (setupData.adminUsername === formData.username && setupData.adminPassword === formData.password) {
      localStorage.setItem('isLoggedIn', 'true');
      window.location.href = '/dashboard';
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-16 bg-white dark:bg-gray-900 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-400 drop-shadow">Login</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white" htmlFor="username">Username</Label>
            <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white" htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
          </div>
          <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg">Login</Button>
        </form>
      </CardContent>
    </Card>
  );
}
