import React, { useEffect, useState } from "react";
import {
  getCategories,
  getAllProductsByCategory,
  addProducts,
  deleteProductDynamic,
  editProductDynamic,
} from "../../services/productServices";
import { FaPlus, FaMinus, FaTrash, FaEdit } from "react-icons/fa";
import AllPropertyValuesTable from "./AllPropertyValuesTable";

function CreateProduct() {
  // -------------------
  // Add‑Product & Edit‐Product state
  // -------------------
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductDetails, setNewProductDetails] = useState("");
  const [pictureLink, setPictureLink] = useState("");

  const [editingProductId, setEditingProductId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDetails, setEditDetails] = useState("");
  const [editPictureLink, setEditPictureLink] = useState("");
  const [editPictureLinkFile, setEditPictureLinkFile] = useState(null);
  const [toast, setToast] = useState({ message: "", isError: false });

  // Fetch categories on mount
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // When a category is picked, clear old products and load new ones
  const handleCategorySelect = async (category) => {
    setSelectedCategory(category.name);
    setEditingProductId(null);
    setProducts([]);
    try {
      const list = await getAllProductsByCategory(category.name);
      console.log(list);
      setProducts(list || []);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  // Add the new product to the local list
  const addProductToList = () => {
    if (!newProductName.trim()) return;
    setProducts([
      ...products,
      {
        id: Date.now(), // temp ID
        name: newProductName.trim(),
        description: newProductDescription.trim(),
        details: newProductDetails.trim(),
        pictureLink: pictureLink.trim(),
        isNew: true,
      },
    ]);
    setNewProductName("");
    setNewProductDescription("");
    setNewProductDetails("");
    setPictureLink("");
    setShowInput(false);
  };

  // Remove a pending (new) product
  const removeProduct = (idx) =>
    setProducts(products.filter((_, i) => i !== idx));

  // Delete an existing product via API
  const handleDeleteExisting = async (prodId) => {
    try {
      await deleteProductDynamic(selectedCategory, prodId);
      setProducts(products.filter((p) => p.id !== prodId));
      setToast({ message: "Product deleted", isError: false });
    } catch (err) {
      console.error("Error deleting product", err);
      setToast({ message: "Delete failed", isError: true });
    }
  };

  // Begin editing an existing product
  const handleEditClick = (prod) => {
    setEditingProductId(prod.id);
    setEditName(prod.name || "");
    setEditDescription(prod.description || "");
    setEditDetails(prod.details || "");
    setEditPictureLink(prod.pictureLink || "");
  };

  // Save edits to API and update local state
  const handleSaveEdit = async (prodId) => {
    try {
      await editProductDynamic({
        categoryName: selectedCategory,
        productId: prodId,
        name: editName,
        description: editDescription,
        details: editDetails,
        file: editPictureLinkFile, // Pass the file here
      });

      // Update the local list
      setProducts(
        products.map((p) =>
          p.id === prodId
            ? {
                ...p,
                name: editName,
                description: editDescription,
                details: editDetails,
                pictureLink: URL.createObjectURL(editPictureLinkFile), // Temporary preview
              }
            : p
        )
      );

      setEditingProductId(null);
      setToast({ message: "Product updated", isError: false });
    } catch (err) {
      console.error("Error editing product", err);
      setToast({ message: "Edit failed", isError: true });
    }
  };

  const handleCancelEdit = () => setEditingProductId(null);

  // Persist all new products
  const saveProducts = async () => {
    try {
      for (const prod of products) {
        if (prod.isNew) {
          await addProducts(
            { name: prod.name },
            selectedCategory,
            prod.pictureLink,
            prod.description,
            prod.details
          );
        }
      }
      setToast({ message: "Products saved!", isError: false });
      window.location.reload();
    } catch (err) {
      console.error("Error saving products", err);
      setToast({ message: "Error saving products", isError: true });
    }
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(
      () => setToast({ message: "", isError: false }),
      3000
    );
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="min-h-screen mx-20 pt-14 pl-40 pr-40 pb-20 bg-gray">
      <h1 className="text-2xl font-rblack font-bold mb-5">
        Add & Edit Products
      </h1>
      {toast.message && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow z-50
          ${
            toast.isError
              ? "bg-red-100 text-red-700 border-red-400"
              : "bg-green-100 text-green-700 border-green-400"
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

      {/* Category selector */}
      <h2 className="mb-3">Select a Category</h2>
      <div className="flex flex-wrap gap-3 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat)}
            className={`rounded-2xl shadow-sm px-5 py-2 ${
              selectedCategory === cat.name
                ? "bg-green-500 text-white"
                : "bg-white text-black"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products list */}
      {selectedCategory && (
        <div>
          <h3 className="mb-3">Products in {selectedCategory}</h3>
          <div className="flex flex-wrap gap-3 items-start mb-4 ">
            {products.length ? (
              products.map((prod, idx) => (
                <div
                  key={prod.id}
                  className="relative bg-white rounded-2xl shadow-sm p-4 pt-5 pr-12"
                >
                  {editingProductId === prod.id ? (
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border p-2 rounded w-full"
                        placeholder="Product name"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="border p-2 rounded w-full h-16"
                        placeholder="Description"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setEditPictureLinkFile(e.target.files[0])
                        }
                        className="border p-2 rounded w-full"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(prod.id)}
                          className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-300 text-black px-4 py-2 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col text-left">
                        <span className="font-semibold">{prod.name}</span>
                        {prod.description && (
                          <span className="text-sm text-gray-600">
                            {prod.description.split(" ").slice(0, 2).join(" ")}
                          </span>
                        )}
                        {prod.pictureLink && (
                          <img
                            src={prod.pictureLink}
                            alt={prod.name}
                            className="w-16 h-16 object-cover mt-2"
                          />
                        )}
                      </div>
                      {/* Action icons */}
                      <div className="absolute top-2 right-2 flex gap-2">
                        {prod.isNew ? (
                          <FaMinus
                            onClick={() => removeProduct(idx)}
                            className="cursor-pointer text-red-400 transition-transform duration-200 hover:scale-110"
                          />
                        ) : (
                          <>
                            <FaEdit
                              onClick={() => handleEditClick(prod)}
                              className="cursor-pointer text-blue-500 transition-transform duration-200 hover:scale-110"
                            />
                            <FaTrash
                              onClick={() => handleDeleteExisting(prod.id)}
                              className="cursor-pointer text-red-500 transition-transform duration-200 hover:scale-110"
                            />
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p>No products added yet.</p>
            )}

            {/* Add new product button */}
            <button
              onClick={() => setShowInput(!showInput)}
              className="rounded-full bg-blue-500 text-white p-2 shadow-sm flex items-center justify-center"
            >
              <FaPlus />
            </button>
          </div>

          {/* New-product form */}
          {showInput && (
            <div className="flex flex-col gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm">
              <input
                type="text"
                placeholder="Enter product name"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <textarea
                placeholder="Enter product description"
                value={newProductDescription}
                onChange={(e) => setNewProductDescription(e.target.value)}
                className="border p-2 rounded w-full h-20"
              />
              <textarea
                placeholder="Enter product details"
                value={newProductDetails}
                onChange={(e) => setNewProductDetails(e.target.value)}
                className="border p-2 rounded w-full h-20"
              />
              <input
                type="text"
                placeholder="Enter product image link"
                value={pictureLink}
                onChange={(e) => setPictureLink(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <button
                onClick={addProductToList}
                className="bg-green-500 text-white px-4 py-2 rounded self-start"
              >
                Add Product
              </button>
            </div>
          )}

          {/* Confirm new products */}
          {products.some((p) => p.isNew) && (
            <div className="flex justify-end">
              <button
                onClick={saveProducts}
                className="bg-green-500 hover:bg-green-500/50 text-white px-16 py-2 rounded shadow"
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CreateProduct;
