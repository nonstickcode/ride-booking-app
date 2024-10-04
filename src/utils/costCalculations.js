/**
 * Calculates the total cost of a ride based on distance.
 * @param {number} distance The distance of the ride in miles.
 * @returns {number} The total cost of the ride, rounded up to the nearest whole number.
 */
export function calculateCost(distance) {
  const ratePerMile = 4; // TODO: Add this to Admin Panel for driver adjustment
  const surcharge = 20;  // TODO: Add this to Admin Panel for driver adjustment
  const cost = distance * ratePerMile + surcharge;
  return Math.ceil(cost); // This ensures it's a whole number
}
