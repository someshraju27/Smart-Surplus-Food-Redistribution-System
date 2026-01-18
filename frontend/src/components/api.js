import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api`; // Replace with your backend URL

// Create a donation
export const createDonation = async (donorId, donationData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/donation/create/${donorId}`, donationData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating donation:", error);
    throw error;
  }
};


// // Fetch all donations
// export const fetchAllDonations = async () => {
//   try {
//     const token = localStorage.getItem("token");
//     const response = await axios.get(`${API_URL}/donation/all`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching donations:", error);
//     throw error;
//   }
// };

// export const fetchDonation = async (id) => {
//   try {
//     const token = localStorage.getItem("token");
//     const response = await axios.get(`${API_URL}/donation/${id}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching donations:", error);
//     throw error;
//   }
// };

// // Fetch available donations
// export const fetchAvailableDonations = async () => {
//   try {
//     const token = localStorage.getItem("token");
//     const response = await axios.get(`${API_URL}/donation/available`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching available donations:", error);
//     throw error;
//   }
// };

// // Assign a donation to a volunteer
// export const assignDonation = async (donationId, volunteerId) => {
//   try {
//     const token = localStorage.getItem("token");
//     const response = await axios.patch(
//       `${API_URL}/donation/assign`,
//       { donationId, volunteerId },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error assigning donation:", error);
//     throw error;
//   }
// };

// // Convert user to volunteer
// export const convertToVolunteer = async (userId) => {
//   try {
//     const token = localStorage.getItem("token");
//     const response = await axios.post(
//       `${API_URL}/volunteer/${userId}`,
//       {},
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error converting to volunteer:", error);
//     throw error;
//   }
// };

// export const deleteLocation = async () => {
//   try {
//     console.log("Deleting location for volunteer:", userData.id);
    
//     const response = await axios.delete(`http://localhost:5000/volunteer/${userData.id}/location`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });

//     console.log("API Response:", response.data);
//     alert(response.data.message);
//     navigate("/volunteer-dashboard");

//   } catch (error) {
//     console.error("Error in deleteLocation:", error.response?.data || error.message);
//     alert(error.response?.data?.message || "Something went wrong!");
//   }
// };

// Update volunteer location
export const updateVolunteerLocation = async (userId, latitude, longitude, navigate) => {
  const token = localStorage.getItem("token");
  console.log("Updating location for volunteer:", userId, latitude, longitude);
  console.log("Token:", token);
  
  try {
    const response = await axios.patch(
      `${API_URL}/volunteer/detectLocation/${userId}`,
      { latitude, longitude },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating location:", error);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      navigate("/login"); // Redirect to login page
    }
    throw error;
  }
};


// // Fetch volunteer details
// export const fetchVolunteerDetails = async (userId) => {
//   try {
//     const token = localStorage.getItem("token");
//     const response = await axios.get(`${API_URL}/volunteer/${userId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching volunteer details:", error);
//     throw error;
//   }
// };

// // Fetch nearby food requests
// export const fetchFoodRequests = async () => {
//   try {
//     const token = localStorage.getItem("token");
//     const response = await axios.get(`${API_URL}/donation/available`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching food requests:", error);
//     throw error;
//   }
// };

// // Accept a food request
// export const acceptFoodRequest = async (volunteerId, donationId) => {
//   try {
//     const token = localStorage.getItem("token");
//     const response = await axios.patch(
//       `${API_URL}/volunteer/accept/${volunteerId}/${donationId}`,
//       {},
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error accepting food request:", error);
//     throw error;
//   }
// };

// // Reject a food request
// export const rejectFoodRequest = async (volunteerId, donationId) => {
//   try {
//     const token = localStorage.getItem("token");
//     const response = await axios.patch(
//       `${API_URL}/volunteer/reject/${volunteerId}/${donationId}`,
//       {},
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error rejecting food request:", error);
//     throw error;
//   }
// };

// // Complete a donation
// export const completeDonation = async (volunteerId, donationId, imageUrl) => {
//   try {
//     const token = localStorage.getItem("token");
//     const response = await axios.patch(
//       `${API_URL}/volunteer/complete/${volunteerId}/${donationId}`,
//       { imageUrl },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error completing donation:", error);
//     throw error;
//   }
// };


// export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
//   const R = 6371; // Radius of the earth in km
//   const dLat = (lat2 - lat1) * (Math.PI / 180);
//   const dLon = (lon2 - lon1) * (Math.PI / 180);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1 * (Math.PI / 180)) *
//       Math.cos(lat2 * (Math.PI / 180)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c; // Distance in km
// }

// export async function getNearbyVolunteers(donorLat, donorLng, radiusInKm = 5) {
//   const allVolunteers = await Volunteer.find({ isAvailable: true });

//   const nearby = allVolunteers.filter((volunteer) => {
//     const dist = getDistanceFromLatLonInKm(
//       donorLat,
//       donorLng,
//       volunteer.latitude,
//       volunteer.longitude
//     );
//     return dist <= radiusInKm;
//   });

//   return nearby;
// }