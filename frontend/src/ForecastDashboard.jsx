// React + Tailwind Dashboard with Forecast + Product Insights Tabs (Cleaned + Tab-Aware Upload Handling)
import React, { useState } from "react";
import Papa from "papaparse";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from "recharts";

export default function ForecastDashboard() {
  const [activeTab, setActiveTab] = useState("forecast");
  const [, setFile] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [topItems, setTopItems] = useState([]);

  const generateSimpleForecast = (data) => {
    if (data.length < 2) return [];
    const salesDiffs = [];
    for (let i = 1; i < data.length; i++) {
      salesDiffs.push(data[i].sales - data[i - 1].sales);
    }
    const avgChange = salesDiffs.reduce((sum, d) => sum + d, 0) / salesDiffs.length;
    const lastDate = new Date(data[data.length - 1].date);
    const lastSales = data[data.length - 1].sales;
    const future = [];
    for (let i = 1; i <= 4; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + i * 7);
      future.push({
        date: nextDate.toISOString().split("T")[0],
        sales: Math.round(lastSales + avgChange * i),
      });
    }
    return future;
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) {
      alert("Please choose a file!");
      return;
    }
    setFile(uploadedFile);

    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data;
        if (!parsedData || parsedData.length === 0) {
          alert("CSV is empty or failed to parse.");
          return;
        }

        const headers = Object.keys(parsedData[0]);
        console.log("EXAMPLE ROW KEYS:", headers);

        if (activeTab === "forecast") {
          if (!headers.includes("Date") || !headers.includes("Net Sales")) {
            alert("This file doesn't have the required 'Date' and 'Net Sales' columns.");
            return;
          }
          const cleanedData = parsedData.map(row => ({
            date: row["Date"],
            sales: Number(row["Net Sales"]?.replace("$", "") || 0)
          })).filter(row => row.date && !isNaN(row.sales));

          const futureData = generateSimpleForecast(cleanedData);
          setForecast([...cleanedData, ...futureData]);
        }

        if (activeTab === "products") {
          if (!headers.includes("Item") || !headers.includes("Quantity Sold")) {
            alert("This file doesn't have the required 'Item' and 'Quantity Sold' columns.");
            return;
          }
          const items = parsedData.map(row => ({
            item: row["Item"],
            quantity: Number(row["Quantity Sold"])
          })).filter(row => row.item && !isNaN(row.quantity));

          const sorted = items.sort((a, b) => b.quantity - a.quantity).slice(0, 10);
          setTopItems(sorted);
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-center mb-8">Sauce Bros Pizza Sales Dashboard</h1>

      <div className="max-w-4xl mx-auto mb-6 flex justify-center gap-4">
        {["forecast", "products"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === tab ? "bg-indigo-600 text-white" : "bg-white border"
            }`}
          >
            {tab === "forecast" ? "Sales Forecast" : "Product Insights"}
          </button>
        ))}
      </div>

      {activeTab === "forecast" && (
        <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Upload Date-based Sales CSV</h2>
          <input type="file" accept=".csv" onChange={handleFileUpload} className="mb-4" />
          <h3 className="text-xl font-medium mb-2">Sales Over Time</h3>
          <LineChart width={600} height={300} data={forecast}>
            <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
          </LineChart>
        </div>
      )}

      {activeTab === "products" && (
        <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Top Selling Products</h2>
          <input type="file" accept=".csv" onChange={handleFileUpload} className="mb-4" />
          <BarChart width={600} height={300} data={topItems} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="item" width={150} />
            <Tooltip />
            <Bar dataKey="quantity" fill="#8884d8" />
          </BarChart>
        </div>
      )}
    </div>
  );
}
