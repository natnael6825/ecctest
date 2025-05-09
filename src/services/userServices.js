import axios from "axios";
import Cookies from "js-cookie";

// const baseUrl = "https://eac.awakilo.com/api/UserService";
const baseUrl = "http://localhost:7050/api/UserService";

const getCookie = (name) => {
  const cookieArr = document.cookie.split(";");
  for (let cookie of cookieArr) {
    const [key, value] = cookie.split("=");
    if (key.trim() === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
};

export const getOtp = async (phoneNumber, id) => {
  try {
    const response = await axios.post(`${baseUrl}/sendOtp`, {
      contact_information: phoneNumber,
      chat_id: id,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching OTP:", error);
    throw error;
  }
};

export const verifyOtp = async (
  phoneNumber,
  otp,
  verificationId,
  chatId,
  isUpdatePhone,
  oldPhoneNumber
) => {
  try {
    const response = await axios.post(`${baseUrl}/verifyOtp`, {
      contact_information: phoneNumber,
      otp,
      verificationId,
      chat_id: chatId,
      is_update: isUpdatePhone,
      old_number: oldPhoneNumber,
    });

    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

export const updateUser = async (name) => {
  try {
    const token = Cookies.get("token");
    const bodyData = {
      name,
    };
    const response = await fetch(`${baseUrl}/updateUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error updating user: ", error);
    throw error;
  }
};

export const fetchOfferByFilterNoToken = async ({
  productName,
  grade,
  region,
  transaction,
  type,
  process,
  class: offerClass,
  status,
  is_approved,
  offerType,
  season,
  price,
  priceOperator,
  quantity,
  quantityOperator,
  measurement,
  dateBefore,
  dateAfter,
  dateBetween,
  category,
  latest,
  offerId,
  statusbar,
  fetchUserOffers,
  role,
  contact_information,
  phone,
}) => {
  try {
    const categoryMapping = {
      "Coffee / ቡና": "CoffeeAndMainCommodities",
      "Building Materials / የግንባታ እቃዎች": "BuildingMaterials",
      "Fruit Crops / ፍራፍሬች": "FruitCrops",
      "Grains and Cereals / የእህል ሰብሎች": "GrainsAndCereals",
      "Oil Seeds / የቅባት እህሎች": "OilSeeds",
      "Pulses & Legumes / ጥራጥሬዎች ": "PulsesLegumes",
      "Root Crops / የስራስር ሰብሎች": "RootCrops",
      "Spice & Herbs / ቅመማ ቅመሞቾ": "SpicesHerbs",
      "Vegetables  / አትክልቶች": "Vegetables",
    };

    const normalizedCategory = category
      ? categoryMapping[category] || category
      : category;

    const payload = {
      productName,
      grade,
      region,
      transaction,
      type,
      process,
      class: offerClass,
      status,
      is_approved,
      offerType,
      season,
      price,
      priceOperator,
      quantity,
      quantityOperator,
      measurement,
      dateBefore,
      dateAfter,
      dateBetween,
      category: normalizedCategory,
      latest,
      offerId,
      statusbar,
      fetchUserOffers,
      role,
      contact_information,
      phone,
    };

    const token = Cookies.get("token");

    const response = await axios.post(
      `${baseUrl}/dynamicOfferFilterNoToken`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching offers by filter:", error.message);

    if (error.response) {
      if (error.response.status === 404) {
        return []; // Return an empty array to indicate no offers found
      }
      throw new Error(error.response.data.message || "Error fetching offers.");
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const fetchOfferByFilter = async ({
  productName,
  grade,
  region,
  transaction,
  type,
  process,
  class: offerClass,
  status,
  is_approved,
  offerType,
  season,
  price,
  priceOperator,
  quantity,
  quantityOperator,
  measurement,
  dateBefore,
  dateAfter,
  dateBetween,
  category,
  latest,
  offerId,
  statusbar,
  fetchUserOffers,
  role,
  contact_information,
  phone,
}) => {
  try {
    const categoryMapping = {
      "Coffee / ቡና": "CoffeeAndMainCommodities",
      "Building Materials / የግንባታ እቃዎች": "BuildingMaterials",
      "Fruit Crops / ፍራፍሬች": "FruitCrops",
      "Grains and Cereals / የእህል ሰብሎች": "GrainsAndCereals",
      "Oil Seeds / የቅባት እህሎች": "OilSeeds",
      "Pulses & Legumes / ጥራጥሬዎች ": "PulsesLegumes",
      "Root Crops / የስራስር ሰብሎች": "RootCrops",
      "Spice & Herbs / ቅመማ ቅመሞቾ": "SpicesHerbs",
      "Vegetables  / አትክልቶች": "Vegetables",
    };

    const normalizedCategory = category
      ? categoryMapping[category] || category
      : category;

    const payload = {
      productName,
      grade,
      region,
      transaction,
      type,
      process,
      class: offerClass,
      status,
      is_approved,
      offerType,
      season,
      price,
      priceOperator,
      quantity,
      quantityOperator,
      measurement,
      dateBefore,
      dateAfter,
      dateBetween,
      category: normalizedCategory,
      latest,
      offerId,
      statusbar,
      fetchUserOffers,
      role,
      contact_information,
      phone,
    };

    const token = Cookies.get("token");

    const response = await axios.post(
      `${baseUrl}/dynamicOfferFilter`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching offers by filter:", error.message);

    if (error.response) {
      if (error.response.status === 404) {
        return []; // Return an empty array to indicate no offers found
      }
      throw new Error(error.response.data.message || "Error fetching offers.");
    }

    throw new Error("An unexpected error occurred.");
  }
};

export const fetchUser = async ({ chat_id, contact_information }) => {
  try {
    const queryParams = new URLSearchParams();
    if (chat_id) queryParams.append("chat_id", chat_id);
    if (contact_information)
      queryParams.append("contact_information", contact_information);

    const response = await axios.get(
      `${baseUrl}/fetchuser?${queryParams.toString()}`
    );

    return response;
  } catch (error) {
    console.error("Error fetching user:", error);
    return { error: error.message };
  }
};

export const fetchUserByToken = async () => {
  try {
    // Retrieve the token from cookies (or wherever it is stored)
    const token = getCookie("token");
    if (!token) {
      throw new Error("Token not found in cookies");
    }

    const response = await axios.get(`${baseUrl}/fetchUserByToken`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // Note: You don't need to add method or body for GET requests
    });

    return response;
  } catch (error) {
    console.error("Error fetching user:", error);
    return { error: error.message };
  }
};

export const addUser = async ({ phoneNumber, chatId, fullName }) => {
  try {
    const response = await axios.post(`${baseUrl}/adduser`, {
      contact_information: phoneNumber,
      chat_id: chatId,
      name: fullName,
    });
  } catch (error) {
    console.error("Error registering user", error);
  }
};

export const fetchAllUsers = async () => {
  try {
    const response = await axios.get(`${baseUrl}/fetchAllUser`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all users");
    throw error;
  }
};

export const fetchPostById = async (id) => {
  try {
    console.log("++++++++++++", id);
    const response = await axios.post(`${baseUrl}/fetchpostById`, {
      postId: id,
    });
    console.log("+++++++++++", response.data);

    return response.data;
  } catch (error) {
    console.error("Error Feching post: ", error);
    throw error;
  }
};
