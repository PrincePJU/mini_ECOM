// Function to calculate distance
// const calculateDistance = (loc1, loc2) => {
//     const toRadians = (degrees) => (degrees * Math.PI) / 180;
//     const R = 6371; // Earth's radius in km
//     const dLat = toRadians(loc2.latitude - loc1.latitude);
//     const dLon = toRadians(loc2.longitude - loc1.longitude);

//     const a =
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos(toRadians(loc1.latitude)) *
//             Math.cos(toRadians(loc2.latitude)) *
//             Math.sin(dLon / 2) *
//             Math.sin(dLon / 2);

//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c; // Distance in km
// };

// Function to optimize the route
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    // Earth's radius in kilometers
    const R = 6371;
  
    // Convert latitude and longitude to radians
    const toRadians = (degree) => degree * (Math.PI / 180);
    
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    // Distance in kilometers
    return R * c;
  };


  module.exports = {haversineDistance };
