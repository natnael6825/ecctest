import React, { useEffect, useState } from "react";
import {
  getCategories,
  getPropertiesByCategory,
  addProperties,
} from "../../services/productServices";
import { FaPlus, FaMinus } from "react-icons/fa";

function CreateProperty() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [properties, setProperties] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState("");
  const [toast, setToast] = useState({ message: "", isError: false });

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category.name);
    setProperties([]);
    try {
      const data = await getPropertiesByCategory(category.name);
      setProperties(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addPropertyToList = () => {
    if (!newPropertyName.trim()) return;
    setProperties([
      ...properties,
      { name: newPropertyName.trim(), isNew: true },
    ]);
    setNewPropertyName("");
    setShowInput(false);
  };

  const removeProperty = (idx) =>
    setProperties(properties.filter((_, i) => i !== idx));

  const saveProperties = async () => {
    try {
      for (const p of properties) {
        if (p.isNew) {
          await addProperties(p.name, selectedCategory);
        }
      }

      setToast({ message: "Properties added!", isError: false });

      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(
      () => setToast({ message: "", isError: false }),
      3000
    );
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="min-h-screen pb-20 mx-20 pt-14 pb-14 pl-40 pr-40 bg-gray">
      <h1 className="text-2xl font-rblack font-bold mb-5">Add Properties</h1>
      <h1 className="mb-3">Select a Category for Properties</h1>
      <div className="flex flex-wrap gap-3">
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

      {selectedCategory && (
        <div className="mt-10">
          <h2 className="mb-3">Properties in {selectedCategory}</h2>
          <div className="flex flex-wrap gap-3 items-center">
            {properties.length ? (
              properties.map((prop, idx) => (
                <button
                  key={idx}
                  className="rounded-2xl shadow-sm px-5 py-2 bg-white text-black flex items-center"
                >
                  <span>{prop.name}</span>
                  {prop.isNew && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        removeProperty(idx);
                      }}
                      className="ml-3 text-red-400 cursor-pointer"
                    >
                      <FaMinus />
                    </span>
                  )}
                </button>
              ))
            ) : (
              <p>No properties added yet.</p>
            )}
            <button
              onClick={() => setShowInput(!showInput)}
              className="rounded-full bg-blue-500 text-white p-2 shadow-sm flex items-center justify-center"
            >
              <FaPlus />
            </button>
          </div>
          {showInput && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter property name"
                value={newPropertyName}
                onChange={(e) => setNewPropertyName(e.target.value)}
                className="border p-2 rounded"
              />
              <button
                onClick={addPropertyToList}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Add Property
              </button>
            </div>
          )}

          {properties.length > 0 && (
            <div className="mt-10 items-end justify-end flex">
              <button
                onClick={saveProperties}
                className="bg-green-500 hover:bg-green-500/50 text-white px-16 py-2 rounded shadow mr-10"
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

export default CreateProperty;
