import React, { useEffect, useState } from "react";
import {
  calculateProductValues,
  getCategories,
  fetchProductDynamic,
} from "../../services/productServices";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

function ProductValueCalc() {
  const [values, setValues] = useState([]);
  const [filteredValues, setFilteredValues] = useState([]); // For filtered results
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]); // For product dropdown
  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: new Date().toISOString().split("T")[0], // Set default end date to today
    productId: "",
  });
  const [searchTerm, setSearchTerm] = useState(""); // State for the search bar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const exportToExcel = () => {
    const exportData = filteredValues.map((val) => ({
      "Product Name": val.name,
      "Total Quantity (quintal)": val.total_quintal,
      "Unit Price": val.price,
      "Estimated Total Value": val.estimated_total_value,
      "Last Updated": val.updatedAt
        ? new Date(val.updatedAt).toLocaleDateString()
        : "N/A",
      Category: val.category,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Values");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Product_Values_${Date.now()}.xlsx`);
  };

  const fetchValues = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await calculateProductValues({
        category: filters.category,
        productId: filters.productId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });

      if (Array.isArray(result)) {
        setValues(result);
        setFilteredValues(result); // Initialize filtered values
      } else {
        setValues([]);
        setFilteredValues([]);
        setError(result.message || "No data found.");
      }
    } catch (err) {
      setError("Failed to load product values.");
      console.error(err);
    }

    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchProducts = async (categoryName) => {
    if (!categoryName) {
      setProducts([]);
      return;
    }

    try {
      const result = await fetchProductDynamic(categoryName);
      setProducts(result || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchValues();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchValues();
  }, [filters]);

  // Fetch products when category changes
  useEffect(() => {
    fetchProducts(filters.category);
  }, [filters.category]);

  // Filter values based on the search term
  useEffect(() => {
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const filtered = values.filter((val) =>
        val.name?.toLowerCase().includes(lowerCaseSearchTerm)
      );
      setFilteredValues(filtered);
    } else {
      setFilteredValues(values); // Reset to all values if search term is empty
    }
  }, [searchTerm, values]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const totalEstimatedValue = filteredValues.reduce(
    (acc, curr) => acc + (curr.estimated_total_value || 0),
    0
  );

  const dateRangeText =
    filters.startDate && filters.endDate
      ? `${filters.startDate} to ${filters.endDate}`
      : "for the past 2 weeks";

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Product Value Calculations</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          name="productId"
          value={filters.productId}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">All Products</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>

        <div className="flex flex-row items-center justify-center gap-2">
          <label htmlFor="startDate" className="mb-1 text-sm font-medium flex">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-row items-center justify-center gap-2">
          <label htmlFor="endDate" className="mb-1 text-sm font-medium">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-transparent text-black border-2 border-green-400 shadow-md px-4 py-2 rounded hover:bg-green-700 hover:text-white transition-all"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        </div>
      </div>
      <div className="mb-4 text-lg font-medium">
        Total Estimated value for the selected product/s in the selected time
        range ({dateRangeText}) is{" "}
        <span className="font-bold">
          {totalEstimatedValue.toLocaleString(undefined, {
            style: "currency",
            currency: "USD", // Change to your preferred currency
            maximumFractionDigits: 2,
          })}
        </span>
      </div>

      {/* Status Messages */}
      {loading ? (
        <div>Loading product values...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : filteredValues.length === 0 ? (
        <div>No product values found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <thead>
              <tr>
                <th className="border px-4 py-2">Product Name</th>
                <th className="border px-4 py-2">Total Quantity (quintal)</th>
                <th className="border px-4 py-2">Unit Price</th>
                <th className="border px-4 py-2">Estimated Total Value</th>
                <th className="border px-4 py-2">Last Updated</th>
                <th className="border px-4 py-2">Category</th>
              </tr>
            </thead>
            <tbody>
              {filteredValues.map((val) => (
                <tr key={val.productId}>
                  <td className="border px-4 py-2">{val.name}</td>
                  <td className="border px-4 py-2">
                    {val.total_quintal.toFixed(2)}
                  </td>
                  <td className="border px-4 py-2">{val.price}</td>
                  <td className="border px-4 py-2">
                    {val.estimated_total_value}
                  </td>
                  <td className="border px-4 py-2">
                    {val.updatedAt
                      ? new Date(val.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="border px-4 py-2">{val.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProductValueCalc;
