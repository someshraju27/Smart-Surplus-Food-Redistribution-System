// let io;

// const setSocketIOInstance = (serverIO) => {
//   io = serverIO;
// };

// const notifyVolunteer = (volunteerId, data) => {
//   if (!io) return console.error("Socket.IO not initialized!");

//   io.to(volunteerId).emit("clusterNotification", {
//     message: "New nearby request cluster available!",
//     data,
//   });

//   console.log(`✅ Notified volunteer ${volunteerId}`);
// };

// module.exports = {
//   setSocketIOInstance,
//   notifyVolunteer,
// };
