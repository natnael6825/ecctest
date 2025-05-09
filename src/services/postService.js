import axios from "axios";

// const baseUrl = "https://eac.awakilo.com/api/UserService";
const baseUrl = "http://localhost:7050/api/Admin";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

export const createPost = async (title, body, source, type) => {
  try {
    console.log(title, body, source, type);
    // Retrieve the token from cookie using the helper function
    const token = getCookie("token");
    const response = await axios.post(
      `${baseUrl}/createpost`,
      { title, body, source, type },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating post: ", error);
    throw error;
  }
};

export const editpost = async (postId, title, body, source,type) => {
  const token = getCookie("token");
  try {
    const response = await axios.post(
      `${baseUrl}/editpost`,
      {
        postId,
        title,
        body,
        source,
        type
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error editing post: ", error);
    throw error;
  }
};

export const getAllPost = async () => {
  const token = getCookie("token");
  console.log(token);
  try {
    const response = await axios.post(
      `${baseUrl}/fetchAllPost`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching post: ", error);
    throw error;
  }
};

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    // Append fileName if your backend requires it.
    formData.append("fileName", file.name);

    const response = await axios.post(
      `http://localhost:7050/api/Fileupload/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    // Assuming your backend returns { filelink, message }
    return response.data;
  } catch (error) {
    console.error("Error uploading file: ", error);
    throw error;
  }
};

export const sendToGroup = async (postIds, message, topicId) => {
  try {
    const token = getCookie("token");
    const response = await axios.post(`${baseUrl}/sendposttogroup`, {
      postIds,
      message,
      topicId,
      token
    },{headers: { Authorization: `Bearer ${token}` }});
    return response.data;
  } catch (error) {
    console.error("Error sending posts to group: ", error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  const token = getCookie("token");

  try {
    const response = await axios.post(
      `${baseUrl}/deletepost`,
      { postId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting post: ", error);
    throw error;
  }
};
