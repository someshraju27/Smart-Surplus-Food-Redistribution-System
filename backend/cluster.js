const mongoose = require('mongoose');
const PendingRequest = require('../models/pendingRequestSchema');
const Cluster = require('../models/clusterSchema');

async function clusterRequests() {
    try {
        const pendingRequests = await PendingRequest.find();

        const clusters = [];

        for (let request of pendingRequests) {
            let added = false;

            for (let cluster of clusters) {
                const distance = await calculateDistance(cluster.center, request.location);
                
                if (distance <= 2) {
                    cluster.requests.push(request.donationId);
                    added = true;
                    break;
                }
            }

            if (!added) {
                clusters.push({ center: request.location, requests: [request.donationId] });
            }
        }

        // Store clusters in DB
        await Cluster.insertMany(clusters);

        console.log("✅ Clustering Completed!");
    } catch (error) {
        console.error("Clustering Error:", error);
    }
}

// Function to calculate distance (using Haversine formula)
async function calculateDistance(loc1, loc2) {
    const R = 6371; // Earth's radius in km
    const lat1 = loc1.latitude, lon1 = loc1.longitude;
    const lat2 = loc2.latitude, lon2 = loc2.longitude;

    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
}

// Run the clustering job every 30 minutes
setInterval(clusterRequests, 30 * 60 * 1000);
