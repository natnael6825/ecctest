import axios from "axios";
import Cookies from "js-cookie";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

// const categoryUrls = {
//   "Coffee / ቡና": "https://eac.awakilo.com/api/CoffeeandMainCommodity",
//   "Spice & Herbs / ቅመማ ቅመሞቾ": "https://eac.awakilo.com/api/spices",
//   "Building Materials / የግንባታ እቃዎች": "https://eac.awakilo.com/api/BuildingMaterials",
//   "Grains and Cereals / የእህል ሰብሎች": "https://eac.awakilo.com/api/GrainsandCerials",
//   "Pulses & Legumes / ጥራጥሬዎች ": "https://eac.awakilo.com/api/pulse",
//   "Oil Seeds / የቅባት እህሎች": "https://eac.awakilo.com/api/oilSeed",
//   "Root Crops / የስራስር ሰብሎች": "https://eac.awakilo.com/api/rootCrop",
//   "Vegetables  / አትክልቶች": "https://eac.awakilo.com/api/vegetable",
//   "Fruit Crops / ፍራፍሬች": "https://eac.awakilo.com/api/fruit",
// };

export const categoryUrls = {
  "Coffee / ቡና": "http://localhost:7050/api/CoffeeandMainCommodity",
  "Spice & Herbs / ቅመማ ቅመሞቾ": "http://localhost:7050/api/spices",
  "Building Materials / የግንባታ እቃዎች":
    "http://localhost:7050/api/BuildingMaterials",
  "Grains and Cereals / የእህል ሰብሎች":
    "http://localhost:7050/api/GrainsandCerials",
  "Pulses & Legumes / ጥራጥሬዎች ": "http://localhost:7050/api/pulse",
  "Oil Seeds / የቅባት እህሎች": "http://localhost:7050/api/oilSeed",
  "Root Crops / የስራስር ሰብሎች": "http://localhost:7050/api/rootCrop",
  "Vegetables  / አትክልቶች": "http://localhost:7050/api/vegetable",
  "Fruit Crops / ፍራፍሬች": "http://localhost:7050/api/fruit",
};

export const addProducts = async (
  productData,
  categoryName,
  picture_link,
  description,
  details
) => {
  console.log(productData, categoryName, picture_link, description);
  const token = getCookie("token");
  try {
    const url = categoryUrls[categoryName];
    if (!url) {
      throw new Error(`Invalid category name: "${categoryName}"`);
    }
    console.log("Posting to:", url);

    const payload = {
      category: categoryName, // <–– tell your backend which model to use
      ...productData, // name (and any other fields in productData)
      picture_link, // e.g. image URL
      description, // your admin’s description
      details,
    };

    // Post the product data to the backend endpoint
    const response = await axios.post(
      `http://localhost:7050/api/Admin/addProduct`,

      payload,

      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding products:", error);
    throw error;
  }
};

export const dynamicOfferFilter = async (filters = {}) => {
  try {
    const token = getCookie("token");
    console.log(filters);
    const response = await axios.post(
      "http://localhost:7050/api/Admin/dynamicOfferFilter",
      filters,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error performing dynamic offer filter:", error);
    return { error: true, message: error.response?.data || error.message };
  }
};

export const offerActivation = async (offerId, status, category) => {
  try {
    console.log(offerId, status, category);
    const token = getCookie("token");

    const response = await axios.post(
      "http://localhost:7050/api/Admin/offerActivation",
      {
        offerId,
        status,
        category,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error activating/deactivating offer:", error);
    return {
      error: true,
      message: error.response?.data?.error || error.message,
    };
  }
};

export const deleteProductDynamic = async (categoryName, productId) => {
  const token = getCookie("token");
  const url = `http://localhost:7050/api/Admin/deleteProductDynamic`;
  if (!url) {
    throw new Error(`Invalid category name: "${categoryName}"`);
  }

  const payload = {
    category: categoryName,
    productId,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // { message: "…deleted successfully" }
  } catch (err) {
    console.error("Error deleting product:", err);
    throw err;
  }
};

export const calculateProductValues = async ({
  category,
  productId,
  date,
  startDate,
  endDate,
} = {}) => {
  const token = getCookie("token");
  const url = "http://localhost:7050/api/Admin/calculateProductValues";

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const body = {};
  if (category) body.category = category;
  if (productId) body.productId = productId;
  if (startDate && endDate) {
    body.startDate = startDate;
    body.endDate = endDate;
  } else if (date) {
    body.date = date;
  }

  try {
    const response = await axios.post(url, body, { headers });
    return response.data;
  } catch (error) {
    console.error(
      "Error calculating product values:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const editProductDynamic = async ({
  categoryName,
  productId,
  name,
  description,
  details,
  categoryid,
  prices,
  previous_price,
  file,
}) => {
  const token = getCookie("token");
  const base = categoryUrls[categoryName];
  if (!base) throw new Error(`Invalid category: "${categoryName}"`);
  const url = `http://localhost:7050/api/Admin/editProductDynamic`;

  let headers = { Authorization: `Bearer ${token}` };
  let body;

  if (file) {
    body = new FormData();
    body.append("category", categoryName);
    body.append("productId", productId);
    if (name !== undefined) body.append("name", name);
    if (description !== undefined) body.append("description", description);
    if (details !== undefined) body.append("details", details);
    if (categoryid !== undefined) body.append("categoryid", categoryid);
    if (prices !== undefined) body.append("prices", prices);
    if (previous_price !== undefined)
      body.append("previous_price", previous_price);
    body.append("file", file, file.name);
    // Don't set Content-Type explicitly for FormData, browser will set it including boundary
  } else {
    // JSON payload
    body = {
      category: categoryName,
      productId,
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(details !== undefined && { details }),
      ...(categoryid !== undefined && { categoryid }),
      ...(prices !== undefined && { prices }),
      ...(previous_price !== undefined && { previous_price }),
    };
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await axios.post(url, body, { headers });
    return response.data;
  } catch (err) {
    console.error("Error editing product:", err);
    throw err;
  }
};

export const editProductPropertiesValueDynamic = async ({
  propertyValueId,
  newValue,
  category,
}) => {
  const token = getCookie("token");
  const url = `http://localhost:7050/api/Admin/editProductPropertiesValue`;

  let headers = { Authorization: `Bearer ${token}` };
  let body;

  // JSON payload
  body = {
    propertyValueId,
    newValue,
    category,
  };

  try {
    const response = await axios.post(url, body, { headers });
    return response.data;
  } catch (err) {
    console.error("Error editing product:", err);
    throw err;
  }
};

export const addProperties = async (name, categoryName) => {
  const token = getCookie("token");
  try {
    const url = categoryUrls[categoryName];
    console.log(url);
    if (!url) {
      throw new Error(`Invalid category name: "${categoryName}"`);
    }
    const response = await axios.post(
      `http://localhost:7050/api/Admin/addProductProperties`,
      { name },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    // axios throws on non-2xx responses so this check may be optional
    return response.data;
  } catch (error) {
    console.error("Error adding properties: ", error);
    throw error;
  }
};

export const addPropertyValues = async (
  productId,
  productPropertyId,
  value,
  categoryName
) => {
  const token = getCookie("token");

  try {
    const url = categoryUrls[categoryName];
    console.log(url);
    if (!url) {
      throw new Error(`Invalid category name: "${categoryName}"`);
    }
    const response = await axios.post(
      `http://localhost:7050/api/Admin/addProductPropertiesValue`,
      {
        productId,
        productPropertyId,
        value,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    // axios throws on non-2xx responses so this check may be optional
    return response.data;
  } catch (error) {
    console.error("Error adding Property Values: ", error);
    throw error;
  }
};

export const getAllProductNames = async () => {
  try {
    const allProductNames = [];
    for (const categoryName in categoryUrls) {
      const baseUrl = categoryUrls[categoryName];
      const response = await axios.get(`${baseUrl}/fetchProduct`);
      const productNames = response.data.map((product) => product.name);
      allProductNames.push(...productNames);
    }

    return allProductNames; // Return only the names
  } catch (error) {
    console.error("Error fetching all Product Names: ", error);
    throw error;
  }
};

export const getProductById = async (productId, category) => {
  try {
    const baseUrl = categoryUrls[category];
    const response = await axios.post(`${baseUrl}/fetchProductById`, {
      productId,
    });
    return response.data;
  } catch (error) {
    console.error("Error finding the product: ", error);
    throw error;
  }
};

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

export const createInteraction = async (
  category,
  poster_name,
  poster_phone_number,
  poster_business_type,
  poster_chat_id,
  viewer_name,
  viewer_phone_number,
  viewer_business_type,
  viewer_chat_id,
  offerId
) => {
  try {
    const mappedCategory = categoryMapping[category];
    if (!mappedCategory) {
      throw new Error(`Invalid category: ${category}`);
    }

    const Baseurl = categoryUrls[mappedCategory];
    const response = await axios.post(`${Baseurl}/createInteraction`, {
      poster_name,
      poster_phone_number,
      poster_business_type,
      poster_chat_id,
      viewer_name,
      viewer_phone_number,
      viewer_business_type,
      viewer_chat_id,
      offerId,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating interaction:", error);
    throw error;
  }
};

export const fetchOffers = async (offerId, phoneNumber) => {
  try {
    console.log(offerId, phoneNumber);
    for (const categoryName in categoryUrls) {
      const baseUrl = categoryUrls[categoryName];
      const response = await axios.get(`${baseUrl}/fetchOffers`, {
        params: { offerId, phoneNumber },
      });
      console.log(response);
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching an offer : ", error);
  }
};

export const updateOffer = async (categoryName, offerData) => {
  try {
    const baseUrl = categoryUrls[categoryName];
    if (!baseUrl) {
      throw new Error(`No URL for category: ${categoryName}`);
    }

    const response = await axios.post(`${baseUrl}/updateOffer`, offerData);
    return response.data;
  } catch (error) {
    console.error("Error updating offer:", error);
    throw error;
  }
};

export const fetchProductDynamic = async (categoryName = null) => {
  const token = getCookie("token");
  const url = `http://localhost:7050/api/Admin/fetchProductDynamic`;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  let body = {};
  if (categoryName) {
    body.category = categoryName;
  }

  try {
    const response = await axios.post(url, body, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getAllProductsByCategory = async (categoryName) => {
  try {
    const baseUrl = categoryUrls[categoryName];
    if (!baseUrl) {
      throw new Error(`No URL for category: ${categoryName}`);
    }
    const response = await axios.get(`${baseUrl}/fetchProduct`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all Products: ", error);
    throw error;
  }
};

export const getPropertiesByProduct = async (productId, categoryName) => {
  try {
    const baseUrl = categoryUrls[categoryName];
    if (!baseUrl) {
      throw new Error(`No URL mapped for category: ${categoryName}`);
    }

    const response = await axios.get(`${baseUrl}/fetchPropertyByProduct`, {
      params: { productId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching properties by product: ", error);
    throw error;
  }
};

export const getPropertiesByCategory = async (categoryName) => {
  try {
    const baseUrl = categoryUrls[categoryName];
    if (!baseUrl) {
      throw new Error(`No URL mapped for category: ${categoryName}`);
    }
    const response = await axios.get(`${baseUrl}/fetchProperties`);
    return response.data;
  } catch (error) {
    console.error("Error fetching properties by product: ", error);
    throw error;
  }
};

export const getPropertyValues = async (
  productId,
  ProductPropertyId,
  categoryName
) => {
  try {
    const baseUrl = categoryUrls[categoryName];
    if (!baseUrl) {
      throw new Error(`No URL mapped for category: ${categoryName}`);
    }
    const response = await axios.get(`${baseUrl}/fetchPropertyValue`, {
      params: { productId, ProductPropertyId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching property values: ", error);
    throw error;
  }
};

const postOfferHelper = async (categoryKey, data) => {
  const baseUrl = categoryUrls[categoryKey];
  if (!baseUrl) {
    throw new Error(`No base URL defined for category: ${categoryKey}`);
  }
  return axios.post(`${baseUrl}/postOffer`, data);
};

export const mainCommoditiesOffer = async (data) => {
  try {
    const response = await postOfferHelper("Coffee / ቡና", data);
    return response.data;
  } catch (error) {
    console.error("Error saving Coffee offer: ", error);
    throw error;
  }
};

export const spiceOffer = async (data) => {
  try {
    const response = await postOfferHelper("Spice & Herbs / ቅመማ ቅመሞቾ", data);
    return response.data;
  } catch (error) {
    console.error("Error saving spices offer: ", error);
    throw error;
  }
};

export const buildingMaterialsOffer = async (data) => {
  try {
    const response = await postOfferHelper(
      "Building Materials / የግንባታ እቃዎች",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error saving building materials offer: ", error);
    throw error;
  }
};

export const grainsOffer = async (data) => {
  try {
    const response = await postOfferHelper(
      "Grains and Cereals / የእህል ሰብሎች",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error saving grains offer: ", error);
    throw error;
  }
};

export const PulsesOffer = async (data) => {
  try {
    const response = await postOfferHelper("Pulses & Legumes / ጥራጥሬዎች ", data);
    return response.data;
  } catch (error) {
    console.error("Error saving pulses offer: ", error);
    throw error;
  }
};

export const oilSeedsOffer = async (data) => {
  try {
    const response = await postOfferHelper("Oil Seeds / የቅባት እህሎች", data);
    return response.data;
  } catch (error) {
    console.error("Error saving oil seeds offer: ", error);
    throw error;
  }
};

export const rootCropsOffer = async (data) => {
  try {
    const response = await postOfferHelper("Root Crops / የስራስር ሰብሎች", data);
    return response.data;
  } catch (error) {
    console.error("Error saving root crops offer: ", error);
    throw error;
  }
};

export const VegetablesOffer = async (data) => {
  try {
    const response = await postOfferHelper("Vegetables  / አትክልቶች", data);
    return response.data;
  } catch (error) {
    console.error("Error saving vegetables offer: ", error);
    throw error;
  }
};

export const fruitCropsOffer = async (data) => {
  try {
    const response = await postOfferHelper("Fruit Crops / ፍራፍሬች", data);
    return response.data;
  } catch (error) {
    console.error("Error saving fruit offer: ", error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await axios.get(
      `https://eac.awakilo.com/api/Preference/categories`
    );
    // const response = await axios.get(`http://localhost:7050/api/Preference/categories`);
    return response.data.categories;
  } catch (error) {
    console.error("Error getting category :", error);
  }
};

export const getUserByPhoneNumber = async (contact_information) => {
  try {
    const response = await axios.get(
      `http://localhost:7050/api/UserService/fetchuser?contact_information=${contact_information}`
    );

    console.log(response.data.user);
    return response.data;
  } catch (error) {
    console.error("Error getting user with phone :", error);
  }
};
