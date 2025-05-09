import axios from "axios";
import config from "../config";

const backendUrl = config.backendUrl;
const EACUrl = "http://104.236.64.33:7050/api/UserService";

const UserEngagement = {
  getUserEngagementType: async () => {
    try {
      const response = await axios.get(`${backendUrl}/user-engagement`);
      return response.data; //d
    } catch (error) {
      console.error("Error fetching product frequency:", error);
      throw new Error("Internal server error");
    }
  },
};

export async function getUsers() {
  try {
    const response = await axios.get(`${EACUrl}/fetchAllUser`);
    return response.data.length;
  } catch (error) {
    console.error("Error getting users: ", error);
  }
}

export async function getAllUsers() {
  try {
    const response = await axios.get(`${EACUrl}/fetchAllUser`);
    return response.data;
  } catch (error) {
    console.error("Error getting users: ", error);
  }
}

export default UserEngagement;
