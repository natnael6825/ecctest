// src/pages/AllPropertyValuesTable.js
import React, { useEffect, useState } from "react";
import {
  getCategories,
  getAllProductsByCategory,
  getPropertiesByProduct,
  getPropertyValues,
} from "../../services/productServices";

export default function AllPropertyValuesTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const cats = (await getCategories()) || [];
        const allRows = [];

        for (let c of cats) {
          const prods = (await getAllProductsByCategory(c.name)) || [];
          for (let p of prods) {
            const props = (await getPropertiesByProduct(p.id, c.name)) || [];
            for (let pr of props) {
              const vals = (await getPropertyValues(p.id, pr.id, c.name)) || [];
              for (let v of vals) {
                const valueLabel = typeof v === "object" ? v.value : v;
                allRows.push({
                  category: c.name,
                  product: p.name,
                  property: pr.name,
                  value: valueLabel,
                });
              }
            }
          }
        }

        setRows(allRows);
      } catch (e) {
        console.error(e);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // 1) Dedupe values into one row per category+product+property:
  const grouped = rows.reduce((acc, { category, product, property, value }) => {
    const key = `${category}||${product}||${property}`;
    if (!acc[key]) {
      acc[key] = { category, product, property, values: new Set() };
    }
    acc[key].values.add(value);
    return acc;
  }, {});

  const deduped = Object.values(grouped).map(
    ({ category, product, property, values }) => ({
      category,
      product,
      property,
      values: Array.from(values).join(", "),
    })
  );

  // 2) Mark only the first row of each category:
  const tableRows = [];
  let lastCategory = null;
  deduped.forEach((r) => {
    const showCategory = r.category !== lastCategory;
    tableRows.push({ ...r, showCategory });
    lastCategory = r.category;
  });

  // Export the displayed tableRows to CSV
  const exportToCSV = () => {
    const headers = ["Category", "Product", "Property", "Values"];
    const csvRows = [
      headers.join(","),
      ...tableRows.map(({ category, product, property, values }) =>
        [category, product, property, values]
          .map((field) => `"${String(field).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "property_values.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <p>Loading all property values…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">All Property Values</h1>
        <button
          onClick={exportToCSV}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2 text-left">Category</th>
              <th className="border px-4 py-2 text-left">Product</th>
              <th className="border px-4 py-2 text-left">Property</th>
              <th className="border px-4 py-2 text-left">Values</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border px-4 py-2">
                  {r.showCategory ? r.category : ""}
                </td>
                <td className="border px-4 py-2">{r.product}</td>
                <td className="border px-4 py-2">{r.property}</td>
                <td className="border px-4 py-2">{r.values}</td>
              </tr>
            ))}
            {tableRows.length === 0 && (
              <tr>
                <td colSpan="4" className="border px-4 py-2 text-center">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
