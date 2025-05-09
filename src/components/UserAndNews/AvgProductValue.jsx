import React, { useEffect, useState } from "react";
import {
  fetchCategories,
  fetchPostedProducts,
  getAllProductNames,
} from "../../services/InteractionAndOffer";

function AvgProductValue() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productNames, setProductNames] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [price, setPrice] = useState("");
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [calculatedTotal, setCalculatedTotal] = useState(null);
  const [posterType, setPosterType] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch categories when the component mounts
  useEffect(() => {
    async function loadCategories() {
      const cats = await fetchCategories();
      setCategories(cats);
    }
    loadCategories();
  }, []);

  // When selectedCategory changes, fetch the product names for that category
  useEffect(() => {
    async function loadProductNames() {
      if (selectedCategory) {
        try {
          const products = await getAllProductNames(selectedCategory);
          setProductNames(products);
        } catch (error) {
          console.error("Error fetching product names: ", error);
          setProductNames([]);
        }
      } else {
        setProductNames([]);
      }
    }
    loadProductNames();
  }, [selectedCategory]);

  // Function to update the total quantity using date filters
  async function updateTotalOffers() {
    if (!selectedCategory || !selectedProduct || posterType === "") return;
    setLoading(true);

    // Map human-friendly category names to the API keys
    const categoryMapping = {
      "Coffee / ቡና": "coffeeAndMainCommodities",
      "Spice & Herbs / ቅመማ ቅመሞቾ": "spices",
      "Building Materials / የግንባታ እቃዎች": "buildingMaterials",
      "Grains and Cereals / የእህል ሰብሎች": "grainsAndCereals",
      "Pulses & Legumes / ጥራጥሬዎች": "pulses",
      "Oil Seeds / የቅባት እህሎች": "oilSeeds",
      "Root Crops / የስራስር ሰብሎች": "rootCrops",
      "Vegetables  / አትክልቶች": "vegetables",
      "Fruit Crops / ፍራፍሬች": "fruits",
    };

    // Use the mapping to get the API key for the selected category.
    const apiCategoryKey = categoryMapping[selectedCategory];
    if (!apiCategoryKey) {
      console.error("No mapping found for category", selectedCategory);
      return;
    }

    try {
      const postedProductsData = await fetchPostedProducts();
      if (postedProductsData[apiCategoryKey]) {
        const offers = postedProductsData[apiCategoryKey].total;
        // Filter offers based on product name and the selected date range.
        const filteredOffers = offers.filter((offer) => {
          if (offer.product?.name !== selectedProduct) return false;

          const offerDate = new Date(offer.createdAt);
          if (fromDate && offerDate < new Date(fromDate)) return false;
          if (toDate && offerDate > new Date(toDate)) return false;

          // Poster type filter
          if (posterType && offer.poster !== posterType) return false;

          return true;
        });

        console.log(
          filteredOffers,
          filteredOffers.quantity,
          filteredOffers.measurement
        );
        console.log(filteredOffers.quantity, filteredOffers.measurement);
        // Sum the quantity from the filtered offers.
        let totalQuantityCalculated = filteredOffers.reduce(
          (acc, offer) => acc + Number(offer.quantity || 0),
          0
        );
        totalQuantityCalculated=totalQuantityCalculated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        setTotalQuantity(totalQuantityCalculated);
      } else {
        setTotalQuantity(0);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posted offers: ", error);
      setTotalQuantity(0);
    }
  }

  // When a product is selected, update the selectedProduct.
  function handleProductChange(e) {
    const product = e.target.value;
    setSelectedProduct(product);
  }

  useEffect(() => {
    updateTotalOffers();
  }, [selectedCategory, selectedProduct, fromDate, toDate, posterType]);

  // Calculate total by multiplying the price and total quantity
  function handleCalculate() {
    const priceNumber = parseFloat(price);
    if (!isNaN(priceNumber)) {
      const cal = priceNumber * totalQuantity;
      const currency_total = cal.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setCalculatedTotal(currency_total);
    }
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="max-w-xl w-full  rounded-lg ">
        {/* Category Dropdown */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 text-lg">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              // Reset product and offer data when the category changes
              setSelectedProduct("");
              setProductNames([]);
              setTotalQuantity(0);
            }}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id || cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Dropdown */}
        {/* Product & Poster Dropdowns */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Product Dropdown */}
          <div>
            <label className="block text-gray-700 mb-2 text-lg">Product:</label>
            <select
              value={selectedProduct}
              onChange={handleProductChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm"
            >
              <option value="">Select Product</option>
              {productNames.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Poster Type Dropdown */}
          <div>
            <label className="block text-gray-700 mb-2 text-lg">
              Poster Type:
            </label>
            <select
              value={posterType}
              onChange={(e) => setPosterType(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm"
            >
              <option value="">All</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Date Filters */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2 text-lg">
              From Date:
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 text-lg">To Date:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-sm"
            />
          </div>
        </div>

        {/* Total Offers Quantity Display */}
        {/* Total Offers Quantity Display */}
        {selectedCategory && selectedProduct && posterType && (
          <div className="mb-4">
            <p className="text-gray-700 text-lg">
              {loading ? (
                "Calculating total quantity..."
              ) : (
                <>
                  Total quantity of the selected product in quintal is:{" "}
                  <strong>{totalQuantity}</strong> quintals
                </>
              )}
            </p>
          </div>
        )}

        {/* Price Input */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 text-lg">
            Enter the average price to calculate the total price:
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        {/* Calculate Button */}
        <div className="mb-4">
          <button
            onClick={handleCalculate}
            className="w-full bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring text-sm"
          >
            Calculate
          </button>
        </div>

        {/* Display Calculated Total */}
        {calculatedTotal !== null && (
          <div className="p-4 bg-gray-50 rounded border border-gray-200 text-center">
            <p className="text-lg font-semibold">Calculated Total:</p>
            <p className="text-xl">{calculatedTotal}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AvgProductValue;
