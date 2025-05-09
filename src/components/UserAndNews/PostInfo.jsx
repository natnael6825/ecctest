import React, { useEffect, useState } from "react";
import { Range } from "react-range";
import axios from "axios"; // Ensure axios is installed
import {
  fetchAllInteraction,
  fetchPostedProducts,
  getAllProductNames,
  fetchCategories,
} from "../../services/InteractionAndOffer";

const PostInfo = () => {
  const [offers, setOffers] = useState([]);
  const [interactionMap, setInteractionMap] = useState({});
  const [firstInteractionMap, setFirstInteractionMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for category & product filtering
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Existing state for poster filter and date range
  const [posterFilter, setPosterFilter] = useState(null);
  const [dates, setDates] = useState([]);
  const [dateRange, setDateRange] = useState([0, 0]);

  // Fetch offers and interactions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offersData, interactionsData] = await Promise.all([
          fetchPostedProducts(),
          fetchAllInteraction(),
        ]);

        console.log(offersData);

        // Flatten offers
        const allOffers = Object.entries(offersData).flatMap(
          ([category, { total }]) =>
            total.map((offer) => ({
              ...offer,
              category, // attached for reference only
              uniqueKey: `${offer.product_name}-${offer.id}`,
            }))
        );

        // Count interactions
        const interactionsCount = interactionsData.reduce(
          (acc, interaction) => {
            if (
              interaction.offer &&
              interaction.offer.product_name &&
              interaction.offer.id
            ) {
              const key = `${interaction.offer.product_name}-${interaction.offer.id}`;
              acc[key] = (acc[key] || 0) + 1;
            }
            return acc;
          },
          {}
        );

        // Determine first interaction time per offer
        const firstTimes = interactionsData.reduce((acc, interaction) => {
          if (
            interaction.offer &&
            interaction.offer.product_name &&
            interaction.offer.id &&
            interaction.createdAt
          ) {
            const key = `${interaction.offer.product_name}-${interaction.offer.id}`;
            const time = new Date(interaction.createdAt).getTime();
            if (!acc[key] || time < acc[key]) {
              acc[key] = time;
            }
          }
          return acc;
        }, {});

        setOffers(allOffers);
        setInteractionMap(interactionsCount);
        setFirstInteractionMap(firstTimes);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute sorted unique dates from offers
  useEffect(() => {
    if (offers.length > 0) {
      const uniqueDates = Array.from(
        new Set(
          offers.map(
            (offer) => new Date(offer.createdAt).toISOString().split("T")[0]
          )
        )
      ).sort((a, b) => new Date(a) - new Date(b));
      setDates(uniqueDates);
      setDateRange([0, uniqueDates.length - 1]);
    }
  }, [offers]);

  // Fetch categories for the category dropdown
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const categoryData = await fetchCategories();
        setCategories(categoryData);
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };
    fetchCategoryData();
  }, []);

  // When a category is selected, reset the product list and selection, then fetch its products.
  useEffect(() => {
    // Reset product selection and list immediately on category change.
    setSelectedProduct(null);
    setCategoryProducts([]);

    const fetchProducts = async () => {
      if (selectedCategory) {
        try {
          const products = await getAllProductNames(selectedCategory);
          setCategoryProducts(products);
        } catch (err) {
          console.error("Error fetching products for category", err);
        }
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // Helper to format gap between post and first view
  const formatTimeGap = (postTime, firstViewTime) => {
    if (!firstViewTime) return "—";
    let diff = firstViewTime - postTime;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);
    const seconds = Math.floor(diff / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const formatDuration = (diff) => {
    let remaining = diff;
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    remaining -= days * 1000 * 60 * 60 * 24;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    remaining -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(remaining / (1000 * 60));
    remaining -= minutes * 1000 * 60;
    const seconds = Math.floor(remaining / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };
  const baseline = new Date("2024-04-08T17:34:00Z").getTime();

  // Filter & enrich offers
  const filteredOffers = offers
    .filter((offer) => {
      const date = new Date(offer.createdAt).toISOString().split("T")[0];
      const start = dates[dateRange[0]];
      const end = dates[dateRange[1]];
      const byProduct = selectedProduct
        ? offer.product_name === selectedProduct
        : true;
      const byDate = start && end ? date >= start && date <= end : true;
      const byPoster = posterFilter
        ? posterFilter === "admin"
          ? offer.poster.toLowerCase() === "admin"
          : offer.poster.toLowerCase() !== "admin"
        : true;
      // only include posts after your baseline:
      const createdAtMs = new Date(offer.createdAt).getTime();
      const afterBaseline = createdAtMs >= baseline;

      return byProduct && byDate && byPoster && afterBaseline;
    })
    .map((offer) => {
      const postTime = new Date(offer.createdAt).getTime();
      const firstTime = firstInteractionMap[offer.uniqueKey];
      const gap = firstTime ? firstTime - postTime : null;
      return {
        ...offer,
        timeGap: gap != null ? formatDuration(gap) : "—",
        rawGap: gap,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Total post count based on filters
  const totalPosts = filteredOffers.length;

  // Totals
  // const totalPosts = filteredOffers.length;
  const totalViews = filteredOffers.reduce(
    (sum, o) => sum + (interactionMap[o.uniqueKey] || 0),
    0
  );

  // Average time gap
  const diffs = filteredOffers.map((o) => o.rawGap).filter((d) => d != null);
  const averageTimeGap = diffs.length
    ? formatDuration(diffs.reduce((a, b) => a + b, 0) / diffs.length)
    : "—";

  return (
    <div className="p-4">
      {/* Category Dropdown (for selecting the product list) */}
      <div className="flex gap-5">
        <div className="mb-10">
          <label htmlFor="categoryFilter" className="mr-2 font-bold text-lg">
            Select Category:
          </label>
          <select
            id="categoryFilter"
            value={selectedCategory || "all"}
            onChange={(e) =>
              setSelectedCategory(
                e.target.value === "all" ? null : e.target.value
              )
            }
            className="p-2 border rounded"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Dropdown (populated based on the selected category) */}
        <div className="mb-10">
          <label htmlFor="productFilter" className="mr-2 font-bold text-lg">
            Filter by Product:
          </label>
          <select
            id="productFilter"
            value={selectedProduct || "all"}
            onChange={(e) =>
              setSelectedProduct(
                e.target.value === "all" ? null : e.target.value
              )
            }
            className="p-2 border rounded"
            disabled={!selectedCategory}
          >
            <option value="all">All Products</option>
            {categoryProducts.map((product) => (
              <option key={product} value={product}>
                {product}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Poster Filter */}
        <div className="mb-10">
          <label htmlFor="posterFilter" className="mr-2 font-bold text-lg">
            Filter by Poster:
          </label>
          <select
            id="posterFilter"
            value={posterFilter || "all"}
            onChange={(e) =>
              setPosterFilter(e.target.value === "all" ? null : e.target.value)
            }
            className="p-2 border rounded"
          >
            <option value="all">All</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="mb-10 flex items-center gap-8">
          <div className="text-lg font-semibold text-gray-700">
            Total Posts: <span className="text-blue-600">{totalPosts}</span>
          </div>
          <div className="text-lg font-semibold text-gray-700">
            Total Views: <span className="text-blue-600">{totalViews}</span>
          </div>
          <div className="text-lg font-semibold text-gray-700">
            Average Time to First View:{" "}
            <span className="text-blue-600">{averageTimeGap}</span>
          </div>
        </div>
      </div>
      {/* Date Range Slider */}
      {dates.length > 0 && (
        <div
          className="mb-4"
          style={{ marginTop: "20px", position: "relative" }}
        >
          <Range
            values={dateRange}
            step={1}
            min={0}
            max={dates.length - 1}
            onChange={(values) => setDateRange(values)}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: "8px",
                  width: "100%",
                  backgroundColor: "#ddd",
                  borderRadius: "8px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    height: "100%",
                    backgroundColor: "#4A90E2",
                    borderRadius: "8px",
                    left: `${(dateRange[0] / (dates.length - 1)) * 100}%`,
                    width: `${
                      ((dateRange[1] - dateRange[0]) / (dates.length - 1)) * 100
                    }%`,
                  }}
                />
                {children}
              </div>
            )}
            renderThumb={({ props, index }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: "20px",
                  width: "20px",
                  backgroundColor: "#4A90E2",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-28px",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "12px",
                    padding: "4px",
                    backgroundColor: "#4A90E2",
                    borderRadius: "4px",
                  }}
                >
                  {dates[dateRange[index]]}
                </div>
              </div>
            )}
          />
        </div>
      )}

      {/* Offers Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Product Name</th>
            <th className="border border-gray-300 p-2">Posted by</th>
            <th className="border border-gray-300 p-2">View count</th>
            <th className="border border-gray-300 p-2">Time to First View</th>
            <th className="border border-gray-300 p-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {filteredOffers.map((offer) => (
            <tr key={offer.uniqueKey} className="border border-gray-300">
              <td className="border border-gray-300 p-2">
                {offer.product_name}
              </td>
              <td className="border border-gray-300 p-2">{offer.poster}</td>
              <td className="border border-gray-300 p-2">
                {interactionMap[offer.uniqueKey] || 0}
              </td>
              <td className="border border-gray-300 p-2">{offer.timeGap}</td>
              <td className="border border-gray-300 p-2">
                {new Date(offer.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostInfo;
