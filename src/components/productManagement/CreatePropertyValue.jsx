// src/pages/CreatePropertyValue.js
import React, { useEffect, useState } from "react";
import {
  getAllProductsByCategory,
  getPropertiesByProduct,
  getPropertyValues,
  addPropertyValues,
  getCategories,
  editProductPropertiesValueDynamic,
} from "../../services/productServices";
import { FaPlus, FaMinus, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

function CreatePropertyValue() {
  const [cat, setCat] = useState("");
  const [products, setProducts] = useState([]);
  const [propList, setPropList] = useState([]);
  const [vals, setVals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selProd, setSelProd] = useState(null);
  const [selProp, setSelProp] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [newVal, setNewVal] = useState("");
  const [toast, setToast] = useState({ message: "", isError: false });
  const [editingValueIndex, setEditingValueIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    getCategories()
      .then((cats) => setCategories(cats || []))
      .catch((e) => console.error("Error loading categories:", e));
  }, []);

  const handleEditValueClick = (v, idx) => {
    // stop <button>’s onClick bubbling if needed
    setEditingValueIndex(idx);
    setEditValue(v.value);
  };

  const handleSaveValueEdit = async (idx) => {
    const valToEdit = vals[idx];
    try {
      // call your backend
      await editProductPropertiesValueDynamic({
        propertyValueId: valToEdit.id,
        newValue: editValue,
        category: cat,
      });

      // update local list
      setVals((prev) =>
        prev.map((v, i) => (i === idx ? { ...v, value: editValue } : v))
      );

      // exit edit mode
      setEditingValueIndex(null);
    } catch (err) {
      console.error("Error updating property value:", err);
      // optionally show a toast or set an error state here
    }
  };

  const selectCategory = async (c) => {
    setCat(c.name);
    setProducts([]);
    setSelProd(null);
    setPropList([]);
    setSelProp(null);
    setVals([]);
    try {
      const data = await getAllProductsByCategory(c.name);
      setProducts(data || []);
    } catch (e) {
      console.error("Error loading products:", e);
    }
  };

  const selectProduct = async (p) => {
    setSelProd(p);
    setPropList([]);
    setSelProp(null);
    setVals([]);
    try {
      const data = await getPropertiesByProduct(p.id, cat);
      setPropList(data || []);
    } catch (e) {
      console.error("Error loading props:", e);
    }
  };

  const selectProperty = async (p) => {
    setSelProp(p);
    setVals([]);
    try {
      const data = await getPropertyValues(selProd.id, p.id, cat);
      setVals(data || []);
    } catch (e) {
      console.error("Error loading vals:", e);
    }
  };

  const addLocalVal = () => {
    if (!newVal.trim()) return;
    setVals([...vals, { value: newVal.trim(), isNew: true }]);
    setNewVal("");
    setShowInput(false);
  };

  const removeLocalVal = (i) => setVals(vals.filter((_, idx) => idx !== i));

  const finish = async () => {
    if (!selProd || !selProp || !cat) {
      setToast({
        message: "Select category, product & property first.!",
        isError: false,
      });

      return;
    }
    try {
      for (let v of vals) {
        if (v.isNew) {
          await addPropertyValues(selProd.id, selProp.id, v.value, cat);
        }
      }

      setToast({ message: "Values added!", isError: false });

      window.location.reload();
    } catch (e) {
      console.error("Error adding vals:", e);
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
      <h1 className="text-2xl font-bold mb-5">Add Property Value</h1>
      <h2 className="mb-3">Select a Category</h2>
      <div className="flex flex-wrap gap-3">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => selectCategory(c)}
            className={`rounded-2xl shadow-sm px-5 py-2 ${
              cat === c.name ? "bg-green-500 text-white" : "bg-white text-black"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      {toast.message && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow z-50
      ${
        toast.isError
          ? "bg-red-100 border-red-400 text-red-700"
          : "bg-green-100 border-green-400 text-green-700"
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

      {cat && (
        <>
          <div className="mt-10">
            <h3 className="mb-3">Products in {cat}</h3>
            <div className="flex flex-wrap gap-3 items-center">
              {products.length ? (
                products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectProduct(p)}
                    className={`rounded-2xl shadow-sm px-5 py-2 ${
                      selProd?.id === p.id
                        ? "bg-green-500 text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    {p.name}
                  </button>
                ))
              ) : (
                <p>No products.</p>
              )}
            </div>
          </div>

          {selProd && (
            <div className="mt-10">
              <h3 className="mb-3">Properties for {selProd.name}</h3>
              <div className="flex flex-wrap gap-3 items-center">
                {propList.length ? (
                  propList.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selectProperty(p)}
                      className={`rounded-2xl shadow-sm px-5 py-2 ${
                        selProp?.id === p.id
                          ? "bg-green-500 text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))
                ) : (
                  <p>No properties.</p>
                )}
              </div>
            </div>
          )}

          {selProp && (
            <div className="mt-10">
              <h3 className="mb-3">Values for {selProp.name}</h3>
              <div className="flex flex-wrap gap-3 items-center">
                {vals.length ? (
                  vals.map((v, i) =>
                    editingValueIndex === i ? (
                      // ───────────── inline edit form ─────────────
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-white rounded-2xl shadow-sm p-2"
                      >
                        <input
                          type="text"
                          className="border p-1 rounded flex-1"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                        />
                        <button
                          onClick={() => handleSaveValueEdit(i)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Save
                        </button>
                        <FaTimes
                          onClick={() => setEditingValueIndex(null)}
                          className="cursor-pointer text-gray-500"
                        />
                      </div>
                    ) : (
                      // ───────────── display button with icons ─────────────
                      <button
                        key={i}
                        className="rounded-2xl shadow-sm px-5 py-2 bg-white text-black flex items-center"
                      >
                        <span className="flex-1">{v.value}</span>

                        {v.isNew ? (
                          <FaMinus
                            onClick={(e) => {
                              e.stopPropagation();
                              removeLocalVal(i);
                            }}
                            className="ml-3 text-red-400 cursor-pointer"
                          />
                        ) : (
                          <FaEdit
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditValueClick(v, i);
                            }}
                            className="ml-3 text-blue-500 cursor-pointer"
                          />
                        )}
                      </button>
                    )
                  )
                ) : (
                  <p>No values.</p>
                )}
                <button
                  onClick={() => setShowInput((v) => !v)}
                  className="rounded-full bg-blue-500 text-white p-2 shadow-sm"
                >
                  <FaPlus />
                </button>
              </div>

              {showInput && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="New value"
                    value={newVal}
                    onChange={(e) => setNewVal(e.target.value)}
                    className="border p-2 rounded"
                  />
                  <button
                    onClick={addLocalVal}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Add
                  </button>
                </div>
              )}

              {vals.length > 0 && (
                <div className="mt-10 flex justify-end">
                  <button
                    onClick={finish}
                    className="bg-green-500 hover:bg-green-500/50 text-white px-16 py-2 rounded shadow"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CreatePropertyValue;
