import React, { useState, useEffect, useRef } from "react";
import {
  Input,
  Button,
  Typography,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import {
  getAllProductsByCategory,
  getCategories,
  getPropertiesByProduct,
  getPropertyValues,
  mainCommoditiesOffer,
  spiceOffer,
  buildingMaterialsOffer,
  grainsOffer,
  PulsesOffer,
  oilSeedsOffer,
  rootCropsOffer,
  VegetablesOffer,
  fruitCropsOffer,
  getProductById,
  getUserByPhoneNumber,
} from "../../services/productServices";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Regex to detect phone numbers (expects unformatted string, e.g., "935148825")
const phoneRegex = /^[79][0-9]{8}$/;

// Helper function to format a phone number for display as +251-XXXXXXXXX
const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  // Remove non-digit characters and remove the leading "0" if present.
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = digits.substring(1);
  }
  return `+251-${digits}`;
};

export function Posting_form_admin() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Sell");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");

  const [commodityProperties, setCommodityProperties] = useState([]);
  const [propertyValues, setPropertyValues] = useState({});
  const [chatId, setChatId] = useState("");
  const [selectedCommodityName, setSelectedCommodityName] = useState("");

  const [productDescription, setProductDescription] = useState("");

  const [quantity, setQuantity] = useState(null);
  const [measurementType, setMeasurementType] = useState("");

  const [price, setPrice] = useState(null);
  const [currency, setCurrency] = useState("Birr");

  // User-related states
  const [userName, setUserName] = useState("");
  // The phoneNumber state will hold raw unformatted digits (e.g., "935148825")
  const [phoneNumber, setPhoneNumber] = useState("");
  const [posterId, setPosterId] = useState("");
  // State to hold the fetched user object (if any)
  const [fetchedUser, setFetchedUser] = useState(null);

  const [country, setCountry] = useState(0);
  const COUNTRIES = ["Ethiopia(+251)"];
  const CODES = ["+251"];

  // Category & Product Lists
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Track if the app is loaded via Telegram
  const [loadedFromTelegram, setLoadedFromTelegram] = useState(false);

  // Measurement options
  const measurementOptions = [
    "KG / ኪግ",
    "FERESULA / ፈረሱላ",
    "BAG / ከረጢት",
    "KESHA / ኬሻ",
    "QUINTAL / ኩንታል",
    "TON / ቶን",
    "FCL",
  ];

  const offerFunctionMapping = {
    "Coffee / ቡና": mainCommoditiesOffer,
    "Spice & Herbs / ቅመማ ቅመሞቾ": spiceOffer,
    "Building Materials / የግንባታ እቃዎች": buildingMaterialsOffer,
    "Grains and Cereals / የእህል ሰብሎች": grainsOffer,
    "Pulses & Legumes / ጥራጥሬዎች ": PulsesOffer,
    "Oil Seeds / የቅባት እህሎች": oilSeedsOffer,
    "Root Crops / የስራስር ሰብሎች": rootCropsOffer,
    "Vegetables  / አትክልቶች": VegetablesOffer,
    "Fruit Crops / ፍራፍሬች": fruitCropsOffer,
  };

  // Ref for debouncing phone search.
  const phoneSearchTimeout = useRef(null);
  // State to control loading icon for user search.
  const [searchingUser, setSearchingUser] = useState(false);

  // 1) Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch categories.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // 2) When a category is selected, fetch its products
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        let products;
        if (selectedCategory === "Roasted Coffee") {
          const roastedCoffeeId = 11;
          const product = await getProductById(
            roastedCoffeeId,
            selectedCategory
          );
          products = [product];
        } else {
          products = await getAllProductsByCategory(selectedCategory);
        }
        setAllProducts(products || []);
        if (products && products.length === 1) {
          setSelectedProductId(products[0].id);
          setSelectedCommodityName(products[0].name);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // 3) Check if launched via Telegram and get Telegram info (if available)
  // useEffect(() => {
  //   if (Object.keys(window.Telegram.WebApp.initDataUnsafe).length !== 0) {
  //     const { user } = window.Telegram.WebApp.initDataUnsafe;
  //     if (user) {
  //       const { id } = user;
  //       setChatId(id);
  //       setLoadedFromTelegram(true);
  //     }
  //   }
  // }, []);

  // 4) When a product is selected, fetch its properties and values
  useEffect(() => {
    if (!selectedProductId || !selectedCategory) return;

    const fetchPropsAndValues = async () => {
      try {
        const propsResponse = await getPropertiesByProduct(
          selectedProductId,
          selectedCategory
        );
        setCommodityProperties(propsResponse);

        const tempValuesMap = {};
        for (const prop of propsResponse) {
          const valResponse = await getPropertyValues(
            selectedProductId,
            prop.id,
            selectedCategory
          );
          tempValuesMap[prop.id] = valResponse;
        }
        setPropertyValues(tempValuesMap);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch property info.");
      }
    };

    fetchPropsAndValues();
  }, [selectedProductId, selectedCategory]);

  // Auto-resize for description textarea.
  const descriptionRef = useRef(null);
  const handleDescriptionChange = (e) => {
    setProductDescription(e.target.value);
    if (descriptionRef.current) {
      descriptionRef.current.style.height = "auto";
      descriptionRef.current.style.height =
        descriptionRef.current.scrollHeight + "px";
    }
  };

  // Validate phone number (expects unformatted input, e.g., "935148825")
  const isValidPhoneNumber = (phone) => {
    if (phone.startsWith("0")) return false;
    return phoneRegex.test(phone);
  };

  // Function to fetch user by phone number and store in fetchedUser.
  const fetchUserByPhone = async (phone) => {
    try {
      setSearchingUser(true);
      const fullPhone = `0${phone}`;
      const response = await getUserByPhoneNumber(fullPhone);
      if (response && response.exists && response.user) {
        setFetchedUser(response.user);
      } else {
        setFetchedUser(null);
        toast.warn("User not found for this phone number.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Could not fetch user info.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
      });
    } finally {
      setSearchingUser(false);
    }
  };

  // When the admin selects the fetched user, autofill the fields.
  const handleSelectFetchedUser = () => {
    if (fetchedUser) {
      setUserName(fetchedUser.name);
      // Normalize phone so that validation passes (remove leading "0")
      const rawPhone = fetchedUser.contact_information;
      const normalized = rawPhone.startsWith("0")
        ? rawPhone.substring(1)
        : rawPhone;
      setPhoneNumber(normalized);
      setPosterId(fetchedUser.id);
      setChatId(fetchedUser.chat_id);
      setFetchedUser(null);
    }
  };

  // Auto-trigger search when phoneNumber reaches 9 digits.
  useEffect(() => {
    if (phoneSearchTimeout.current) clearTimeout(phoneSearchTimeout.current);
    if (phoneNumber.length === 9 && isValidPhoneNumber(phoneNumber)) {
      phoneSearchTimeout.current = setTimeout(() => {
        fetchUserByPhone(phoneNumber);
      }, 300); // 300ms debounce
    }
  }, [phoneNumber]);

  // Handle form submission.
  const handlePost = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (phoneRegex.test(productDescription)) {
      toast.error(
        "Entering contact information in the description is not allowed. Please remove any phone numbers.",
        { position: "top-center", autoClose: 5000, hideProgressBar: true }
      );
      setIsSubmitting(false);
      return;
    }

    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      toast.error(
        "Invalid phone number. It must not start with 0, must start with 7 or 9, and be 9 digits long.",
        { position: "top-center", autoClose: 5000, hideProgressBar: true }
      );
      setIsSubmitting(false);
      return;
    }

    const formattedPhoneNumber = phoneNumber ? `0${phoneNumber}` : null;

    const userInfo = {
      user_name: userName,
      phone_number: formattedPhoneNumber,
      chat_id: null,
      business_type: null,
      is_featured: null,
    };

    const selectedPropertyValues = {};
    commodityProperties.forEach((prop) => {
      const selectedValue = propertyValues[prop.id]?.selectedValue;
      if (selectedValue) {
        selectedPropertyValues[prop.name.toLowerCase()] = selectedValue;
      }
    });

    const newProduct = {
      product_name: selectedCommodityName,
      posted_from: "web",
      productId: selectedProductId,
      description: productDescription,
      quantity,
      measurement: measurementType,
      price,
      poster: "admin",
      currency,
      categoryName: selectedCategory,
      offer_type: selectedOption.toLowerCase(),
      ...selectedPropertyValues,
      ...userInfo,
    };

    const offerFunction = offerFunctionMapping[selectedCategory];
    if (!offerFunction) {
      toast.error("Selected category does not support offers.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await offerFunction(newProduct);
      // navigate("/offerSuccess");
      setSelectedOption("Sell");
      setSelectedCategory("");
      setAllProducts([]);
      setSelectedProductId("");
      setSelectedCommodityName("");
      setCommodityProperties([]);
      setPropertyValues({});
      setProductDescription("");
      setQuantity("");
      setMeasurementType("");
      setPrice("");
      setCurrency("Birr");
      setUserName("");
      setPhoneNumber("");
      setPosterId("");
    } catch (error) {
      console.error("Error posting offer:", error);
      toast.error("There was an error saving your offer. Please try again.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className=" flex flex-col">
      <div className="lg:flex lg:flex-row lg:items-center justify-center  lg:flex-1 lg:px-52 sm:px-8 md:px-32 lg:mt-3 mb-5 ">
        <div className=" rounded-lg lg:shadow-lg sm:shadow-none lg:p-8 px-14 w-full max-w-xl">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">I want to</h1>
          </div>
          <div className="flex space-x-4 mb-6">
            <button
              type="button"
              className={`px-6 py-2 rounded-full ${
                selectedOption === "Sell"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setSelectedOption("Sell")}
            >
              Sell
            </button>
            <button
              type="button"
              className={`px-6 py-2 rounded-full ${
                selectedOption === "Buy"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setSelectedOption("Buy")}
            >
              Buy
            </button>
          </div>
          <form onSubmit={handlePost}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Commodity Category *
              </label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedProductId("");
                  setSelectedCommodityName("");
                }}
              >
                <option value="">Select Category</option>
                {loading ? (
                  <option>Loading...</option>
                ) : error ? (
                  <option>{error}</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Product Name *
              </label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                value={selectedProductId}
                onChange={(e) => {
                  const productId = e.target.value;
                  setSelectedProductId(productId);
                  const p = allProducts.find(
                    (prd) => String(prd.id) === productId
                  );
                  setSelectedCommodityName(p?.name || "");
                }}
                disabled={!selectedCategory}
              >
                <option value="">Select Product</option>
                {loading ? (
                  <option>Loading...</option>
                ) : error ? (
                  <option>{error}</option>
                ) : (
                  allProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            {commodityProperties.length > 0 && (
              <div className="mb-4 p-4 border rounded-md bg-gray-50">
                <h2 className="font-semibold mb-2">Commodity Properties</h2>
                {commodityProperties.map((prop) => (
                  <div key={prop.id} className="mb-2">
                    <label className="block text-gray-700 mb-1">
                      {prop.name}:
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={
                        (propertyValues[prop.id] &&
                          propertyValues[prop.id].selectedValue) ||
                        ""
                      }
                      onChange={(e) => {
                        setPropertyValues((prevValues) => {
                          const current = prevValues[prop.id];
                          const options = Array.isArray(current)
                            ? current
                            : current?.values || [];
                          return {
                            ...prevValues,
                            [prop.id]: {
                              values: options,
                              selectedValue: e.target.value,
                            },
                          };
                        });
                      }}
                    >
                      <option value="">Select {prop.name}</option>
                      {(Array.isArray(propertyValues[prop.id])
                        ? propertyValues[prop.id]
                        : propertyValues[prop.id]?.values || []
                      ).map((valObj, idx) => (
                        <option key={idx} value={valObj.value}>
                          {valObj.value}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Product Description *
              </label>
              <textarea
                ref={descriptionRef}
                className="w-full border border-gray-300 rounded-md p-2 resize-none overflow-hidden"
                placeholder="Enter description"
                value={productDescription}
                onChange={handleDescriptionChange}
              />
            </div>
            {/* User Info Inputs */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Name of User
              </label>
              <input
                id="user_name_input"
                type="text"
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <Typography
                variant="small"
                color="blue-gray"
                className="block text-gray-700 font-medium mb-2"
              >
                Phone Number
              </Typography>
              <div className="relative flex w-full items-center">
                <Menu placement="bottom-start">
                  <MenuHandler>
                    <Button
                      ripple={false}
                      variant="text"
                      color="blue-gray"
                      className="h-10 w-14 shrink-0 rounded-r-none border border-r-0 border-blue-gray-200 bg-transparent px-3"
                    >
                      {CODES[country]}
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-[20rem] max-w-[18rem]">
                    {COUNTRIES.map((countryName, index) => (
                      <MenuItem
                        key={countryName}
                        value={countryName}
                        onClick={() => setCountry(index)}
                      >
                        {countryName}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  type="tel"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="912345678"
                  className="appearance-none rounded-l-none !border-t-blue-gray-200 placeholder:text-blue-gray-300 placeholder:opacity-100 focus:!border-t-gray-900 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  containerProps={{ className: "min-w-0" }}
                />
                {searchingUser && (
                  <div className="absolute right-2 animate-spin border-2 border-t-blue-500 border-gray-300 rounded-full w-5 h-5" />
                )}
              </div>
            </div>
            {/* Fetched user card */}
            {fetchedUser && (
              <div className="mb-4 p-4 border rounded-md bg-gray-100">
                <Typography className="font-medium mb-2">
                  Fetched User:
                </Typography>
                <p>
                  <strong>Name:</strong> {fetchedUser.name}
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  {formatPhoneNumber(fetchedUser.contact_information)}
                </p>
                <p>
                  <strong>Chat ID:</strong> {fetchedUser.chat_id}
                </p>
                <Button
                  size="sm"
                  color="blue"
                  className="mt-2"
                  onClick={handleSelectFetchedUser}
                >
                  Use this user
                </Button>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Product Quantity
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  step="any"
                  className="w-1/2 border border-gray-300 rounded-md p-2"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <select
                  className="w-1/2 border border-gray-300 rounded-md p-2"
                  value={measurementType}
                  onChange={(e) => setMeasurementType(e.target.value)}
                >
                  <option value="">Select Unit</option>
                  {measurementOptions.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="items-end flex justify-end mt-6">
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-2 rounded-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Loading..." : "Post"}
              </button>
            </div>
          </form>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

export default Posting_form_admin;
