import axios from "axios";
import Cookies from "js-cookie";

// const baseUrl = "https://eac.awakilo.com/api/Admin";
const baseUrl = "http://localhost:7050/api/Admin";

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
const token = getCookie("token");

export const adminLogin = async (email, password) => {
  try {
    const response = await axios.post(`${baseUrl}/adminLogin`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error logging in admin :", error);
    throw error;
  }
};

export const getAllBanks = async () => {
  const token = getCookie("token");

  try {
    const response = await axios.get(`${baseUrl}/getAllBanks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting all banks : ", error);
    throw error;
  }
};

export const createExchangeRate = async (
  body,
  source,
  hashtag,
  userMessage
) => {
  const token = getCookie("token");
  console.log(userMessage);
  console.log(token);
  try {
    const response = await axios.post(
      `${baseUrl}/createExchangeRate`,
      {
        body,
        source,
        hashtag: "#ExchangeRates",
        message: userMessage,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating rate:  ", error);
    throw error;
  }
};

export const fetchAllExchangeRate = async () => {
  const token = getCookie("token");
  try {
    const response = await axios.get(
      `${baseUrl}/getAllExchangeRates`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching rate: ", error);
    throw error;
  }
};

// export const fetchExchangeRateByDate = async () => {
//   try {
//     const response  = await axios.get(``)
//   } catch (error) {
//     console.error("Error fetcing ExchangeRateByDate : ", error)
//     throw error
//   }
// }

export const updateExchangeRate = async (body, source, hashtag, id) => {
  try {
    const response = await axios.put(
      `${baseUrl}/updateExchangeRate`,
      {
        exchangeId: id,
        body,
        source,
        hashtag: "#ExchangeRates",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating the exchnge rate: ", error);
  }
};

export const viewCount = async (postId) => {
  try {
    console.log("Count");
    const response = await axios.post(`${baseUrl}/incrementViewCount`, {
      postId,
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating view count : ", error);
    throw error;
  }
};

export const addAdmin = async (name, email, password) => {
  try {
    const response = await axios.post(
      `${baseUrl}/registerAdmin`,
      {
        name,
        email,
        password,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding admin : ", error);
    throw error;
  }
};

export const userActivation = async (
  id,
  contact_information,
  chat_id,
  is_active
) => {
  const token = getCookie("token");

  console.log(id, contact_information, chat_id, is_active, token);
  try {
    const response = await axios.post(
      `${baseUrl}/userActivation`,
      {
        id,
        contact_information,
        chat_id,
        is_active,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error in activation: ", error);
    throw error;
  }
};
