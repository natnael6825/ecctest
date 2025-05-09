import React, { useEffect, useState } from "react";
import {
  dynamicOfferFilter,
  offerActivation,
} from "../../services/productServices";

function ListOffer() {
  const [offers, setOffers] = useState([]);
  const [filters, setFilters] = useState({
    productName: "",
    status: "",
    category: "",
    page: 1,
    latest: true,
  });
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const categoryMapping = {
    CoffeeAndMainCommodities: "Coffee / ቡና",
    FruitCrops: "Fruit Crops / ፍራፍሬች",
    BuildingMaterials: "Building Materials / የግንባታ እቃዎች",
    GrainsAndCereals: "Grains and Cereals / የእህል ሰብሎች",
    PulsesLegumes: "Pulses & Legumes / ጥራጥሬዎች ",
    OilSeeds: "Oil Seeds / የቅባት እህሎች",
    RootCrops: "Root Crops / የስራስር ሰብሎች",
    Vegetables: "Vegetables  / አትክልቶች",
    SpicesHerbs: "Spice & Herbs / ቅመማ ቅመሞቾ",
  };

  const handleToggleStatus = async (offer) => {
    const currentStatus = !!Number(offer.status); // Normalize to boolean
    const newStatus = currentStatus ? 0 : 1;

    const rawCategory = offer.category || filters.category;

    if (!rawCategory) {
      alert("Unable to determine category key for this offer.");
      return;
    }

    const categoryKey = categoryMapping[rawCategory.trim()] || rawCategory;

    const result = await offerActivation(offer.id, newStatus, categoryKey);

    if (result.error) {
      alert("Error: " + result.message);
    } else {
      alert(result.message);
      loadOffers(); // Refresh the list
    }
  };

  const handleView = (offer) => {
    setSelectedOffer(offer);
  };

  const loadOffers = async () => {
    setLoading(true);

    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== "")
    );

    const result = await dynamicOfferFilter(cleanedFilters);

    if (result?.offers) {
      console.log("object", result.offers);
      setOffers(result.offers);
      setPagination(result.pagination);
    } else {
      setOffers([]);
      setPagination(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadOffers();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Filtered Offers</h2>

      {/* Filter Form */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          type="text"
          name="productName"
          value={filters.productName}
          onChange={handleFilterChange}
          placeholder="Product Name"
          className="border p-2 rounded"
        />

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="true">On</option>
          <option value="false">Off</option>
        </select>

        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          <option value="CoffeeAndMainCommodities">Coffee / ቡና</option>
          <option value="SpicesHerbs">Spice & Herbs / ቅመማ ቅመሞቾ</option>
          <option value="GrainsAndCereals">
            Grains and Cereals / የእህል ሰብሎች
          </option>
          <option value="FruitCrops">Fruit Crops / ፍራፍሬች</option>
          <option value="BuildingMaterials">
            Building Materials / የግንባታ እቃዎች
          </option>
          <option value="PulsesLegumes">Pulses & Legumes / ጥራጥሬዎች</option>
          <option value="OilSeeds">Oil Seeds / የቅባት እህሎች</option>
          <option value="RootCrops">Root Crops / የስራስር ሰብሎች</option>
          <option value="Vegetables">Vegetables / አትክልቶች</option>

          {/* Add more categories if needed */}
        </select>
      </div>

      {/* Offers List and Details */}
      <div className="flex gap-4">
        {/* Table Section */}
        <div className="w-1/2 overflow-x-auto">
          {loading ? (
            <div>Loading offers...</div>
          ) : offers.length === 0 ? (
            <div>No offers found.</div>
          ) : (
            <table className="table-auto border-collapse border border-gray-300 w-full">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Image</th>
                  <th className="border border-gray-300 px-4 py-2">Product</th>
                  <th className="border border-gray-300 px-4 py-2">Status</th>
                  <th className="border border-gray-300 px-4 py-2">Poster</th>
                  <th className="border border-gray-300 px-4 py-2">Date</th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer, index) => {
                  const isActive = !!Number(offer.status);

                  return (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">
                        <img
                          src={offer.product?.picture_link || ""}
                          alt={offer.product_name || "No Image"}
                          className="w-16 h-16 object-cover"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {offer.product_name || "N/A"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {isActive ? "Active" : "Inactive"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {offer.poster}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(offer.createdAt).toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                            onClick={() => handleView(offer)}
                          >
                            View
                          </button>
                          <button
                            className={`px-3 py-1 rounded ${
                              isActive
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                            onClick={() => handleToggleStatus(offer)}
                          >
                            {isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Details Section */}
        <div className="w-1/2 border border-gray-300 p-4">
          {selectedOffer ? (
            <div>
              <h3 className="text-lg font-bold mb-2">Offer Details</h3>
              <p>
                <strong>Product Name:</strong> {selectedOffer.product_name}
              </p>
              <p>
                <strong>Category:</strong> {selectedOffer.category}
              </p>
              <p>
                <strong>Region:</strong> {selectedOffer.region}
              </p>
              <p>
                <strong>Quantity:</strong> {selectedOffer.quantity}
              </p>
              <p>
                <strong>Price:</strong> {selectedOffer.price || "N/A"}
              </p>
              <p>
                <strong>Grade:</strong> {selectedOffer.grade}
              </p>
              <p>
                <strong>Process:</strong> {selectedOffer.process}
              </p>
              <p>
                <strong>Transaction:</strong> {selectedOffer.transaction}
              </p>
              <p>
                <strong>Description:</strong> {selectedOffer.description}
              </p>
              <p>
                <strong>Poster:</strong> {selectedOffer.poster}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedOffer.createdAt).toLocaleString()}
              </p>
            </div>
          ) : (
            <div>Select an offer to view details.</div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="mt-4 overflow-x-auto">
          <div className="flex gap-2 w-max">
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 border rounded ${
                  pagination.currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ListOffer;
