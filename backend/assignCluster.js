// const Volunteer = require("../models/volunteerSchema");

// router.post("/assignClusters", async (req, res) => {
//     try {
//         const clusters = await Cluster.find();

//         for (let cluster of clusters) {
//             // Find nearest volunteer
//             const nearestVolunteer = await Volunteer.findOne({
//                 location: {
//                     $near: {
//                         $geometry: { type: "Point", coordinates: [cluster.center.longitude, cluster.center.latitude] },
//                         $maxDistance: 5000 // 5 km range
//                     }
//                 }
//             });

//             if (nearestVolunteer) {
//                 nearestVolunteer.assignedRequests.push(...cluster.requests);
//                 await nearestVolunteer.save();
//             }
//         }

//         res.status(200).json({ message: "Clusters assigned to volunteers successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error assigning clusters", error: error.message });
//     }
// });
