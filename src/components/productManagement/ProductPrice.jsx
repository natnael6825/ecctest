import React, { useEffect, useState } from "react";
import {
  fetchProductDynamic,
  editProductDynamic,
  categoryUrls,
} from "../../services/productServices";

function ProductPrice() {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [filters, setFilters] = useState({
    productName: "",
    status: "",
    category: "",
    page: 1,
    latest: true,
  });
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newPrices, setNewPrices] = useState({});
  const [toast, setToast] = useState({ message: "", isError: false });

  const loadOffers = async () => {
    setLoading(true);
    try {
      let result = [];

      if (filters.category) {
        const res = await fetchProductDynamic(filters.category);
        console.log("fetchProductDynamic response:", res); // Log the response
        result = Array.isArray(res)
          ? res.map((item) => ({ ...item, category: filters.category }))
          : [];
      } else {
        const categoryNames = Object.keys(categoryUrls);
        const allResults = await Promise.all(
          categoryNames.map((cat) =>
            fetchProductDynamic(cat)
              .then((res) => {
                console.log(`fetchProductDynamic response for ${cat}:`, res); // Log the response
                return Array.isArray(res)
                  ? res.map((item) => ({ ...item, category: cat }))
                  : [];
              })
              .catch(() => [])
          )
        );
        result = allResults.flat();
      }

      setOffers(result);
      setPagination(null);
    } catch (error) {
      console.error("Error loading offers:", error);
      setOffers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOffers();
  }, [filters.category]);

  useEffect(() => {
    let filtered = [...offers];

    if (filters.productName) {
      const search = filters.productName.toLowerCase();
      filtered = filtered.filter((offer) =>
        offer.name?.toLowerCase().includes(search)
      );
    }

    // Sort alphabetically by product name
    filtered.sort((a, b) => {
      const nameA = a.name?.toLowerCase() || "";
      const nameB = b.name?.toLowerCase() || "";
      return nameA.localeCompare(nameB);
    });

    setFilteredOffers(filtered);
  }, [filters.productName, offers]);

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handlePriceChange = (id, category, value) => {
    const key = `${id}-${category}`;
    setNewPrices((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleUpdate = async (offerId, categoryName) => {
    const priceKey = `${offerId}-${categoryName}`;
    const newPrice = newPrices[priceKey];
    const offer = offers.find(
      (item) => item.id === offerId && item.category === categoryName
    );

    if (!categoryName) {
      alert("Category name is missing for this offer.");
      return;
    }

    if (!offer) {
      alert("Offer not found.");
      return;
    }

    if (newPrice) {
      try {
        await editProductDynamic({
          categoryName,
          productId: offerId,
          prices: newPrice,
          previous_price: offer.prices || 0, // Send the previous price
        });

        setOffers((prevOffers) =>
          prevOffers.map((offer) =>
            offer.id === offerId && offer.category === categoryName
              ? {
                  ...offer,
                  previous_price: offer.prices, // Update previous_price to the current price
                  prices: newPrice, // Update the current price
                }
              : offer
          )
        );

        // Clear the input and disable the button
        setNewPrices((prevPrices) => {
          const updatedPrices = { ...prevPrices };
          delete updatedPrices[priceKey]; // Remove the entry for the updated product
          return updatedPrices;
        });

        setToast({ message: "Price updated successfully", isError: false });
      } catch (error) {
        console.error("Error updating price:", error);
        setToast({ message: "Failed to update price", isError: true });
      }
    } else {
      alert("Please enter a new price before updating.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Product Prices</h2>

      <div className="mb-4 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Search by product name..."
          value={filters.productName}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              productName: e.target.value,
            }))
          }
          className="border p-2 rounded w-64"
        />
      </div>

      {toast.message && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow z-50 ${
            toast.isError
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {toast.message}
          <button
            onClick={() => setToast({ message: "", isError: false })}
            className="ml-4 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div>Loading offers...</div>
      ) : filteredOffers.length === 0 ? (
        <div>No offers found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">
                  Product Name
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Previous Price
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Current Price
                </th>

                <th className="border border-gray-300 px-4 py-2">New Price</th>
                <th className="border border-gray-300 px-4 py-2">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOffers.map((offer) => (
                <tr key={`${offer.id}-${offer.categoryID}`}>
                  <td className="border border-gray-300 px-4 py-2">
                    {offer.name || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {offer.previous_price || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {offer.prices || "N/A"}
                  </td>

                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={newPrices[`${offer.id}-${offer.category}`] || ""}
                        onChange={(e) =>
                          handlePriceChange(
                            offer.id,
                            offer.category,
                            e.target.value
                          )
                        }
                        className="border p-1 rounded w-32"
                        placeholder="New price"
                      />
                      <button
                        onClick={() => handleUpdate(offer.id, offer.category)}
                        className={`bg-blue-500 text-white px-3 py-1 rounded ${
                          !newPrices[`${offer.id}-${offer.category}`]
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={!newPrices[`${offer.id}-${offer.category}`]} // Disable if no new price
                      >
                        Update
                      </button>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {offer.updatedAt
                      ? new Date(offer.updatedAt).toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProductPrice;
