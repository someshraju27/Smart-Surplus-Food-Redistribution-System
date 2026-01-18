import Volunteer from "../models/volunteerSchema.js";

/**
 * Calculate the distance between two coordinates (in meters)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = x => x * Math.PI / 180;

    const R = 6371; // Earth's radius in KM
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c * 1000; // Convert to meters
}

/**
 * Find the nearest volunteer to a given location
 * @param {Number} latitude 
 * @param {Number} longitude 
 * @param {Array} excludedUserIds - List of user IDs to skip
 * @returns Nearest volunteer not in excluded list
 */
export const findNearestVolunteer = async (latitude, longitude, excludedUserIds = []) => {
    const volunteers = await Volunteer.find({
        isAvailable: true,
        userId: { $nin: excludedUserIds }, // 💡 Exclude already rejected users
    });

    if (!volunteers || volunteers.length === 0) {
        return null; // No eligible volunteers
    }

    let nearestVolunteer = null;
    let minDistance = Infinity;

    for (const volunteer of volunteers) {
        const distance = calculateDistance(
            latitude, longitude,
            volunteer.latitude, volunteer.longitude
        );

        if (distance < minDistance) {
            minDistance = distance;
            nearestVolunteer = volunteer;
        }
    }

    return nearestVolunteer;
};
