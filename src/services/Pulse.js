import axios from "axios";

const coffeeAndMainCommodityBaseUrl = "http://104.236.64.33:7050/api/pulse";

export async function fetchPostedProducts() {
  try {
    const coffeeAndMainCommodityResponse = await axios.get(
      `${coffeeAndMainCommodityBaseUrl}/fetchAllOffers`
    );

    const processOffers = (responseArray) => {
      const buyOffers = responseArray.filter(
        (item) => item.offer_type.toLowerCase() === "buy"
      );
      const sellOffers = responseArray.filter(
        (item) => item.offer_type.toLowerCase() === "sell"
      );

      return {
        buy: buyOffers,
        sell: sellOffers,
        total: [...buyOffers, ...sellOffers],
      };
    };

    const counts = {
      coffeeAndMainCommodities: processOffers(
        coffeeAndMainCommodityResponse.data
      ),
    };
    return counts;
  } catch (error) {
    console.error("Error fetching posted products:", error);
    throw error;
  }
}

export async function fetchAllInteractionNumbers() {
  try {
    const interactionResponse = await axios.get(
      `${coffeeAndMainCommodityBaseUrl}/fetchAllInteraction`
    );

    // Count the number of interaction objects
    const totalInteractions = interactionResponse.data.length;

    return totalInteractions;
  } catch (error) {
    console.error("Error fetching interactions:", error);
    throw error;
  }
}

export const fetchAllInteraction = async () => {
  try {
    const response = await axios.get(
      `${coffeeAndMainCommodityBaseUrl}/fetchAllInteraction`
    );

    return response.data; // Return the array of interactions directly
  } catch (error) {
    console.error("Error fetching interactions:", error);
    throw error;
  }
};

const fetchProductInteractionCount = async (baseUrl) => {
  try {
    const url = `${baseUrl}/fetchProductInteractionCount`;

    const response = await axios.get(url);

    return response.data;
  } catch (error) {
    console.error(
      `Error fetching product interaction counts from ${baseUrl}:`,
      error
    );
    throw error;
  }
};

export const fetchAllProductInteractionCounts = async () => {
  try {
    const coffeeAndMainCommodityCounts = await fetchProductInteractionCount(
      coffeeAndMainCommodityBaseUrl
    );

    return {
      coffeeAndMainCommodityCounts,
    };
  } catch (error) {
    console.error("Error fetching all product interaction counts:", error);
    throw error;
  }
};

// Conversion rates for different measurement types to kilograms (KG)
const conversionRates = {
  bags: 60, // 1 Bag = 60 KG
  quintal: 100, // 1 Quintal = 100 KG
  kesha: 85, // 1 Kesha = 85 KG
  fersula: 17, // 1 Fersula = 17 KG
  fcl: 20000, // 1 FCL = 20000 KG
  ton: 1000, // 1 Ton = 1000 KG
};

// Convert any measurement to kilograms
const convertToKg = (quantity, measurement) => {
  const lowerCaseMeasurement = measurement.toLowerCase();
  const conversionRate = conversionRates[lowerCaseMeasurement] || 1; // Default to 1 if measurement is unrecognized
  return quantity * conversionRate;
};

// Convert kilograms to quintals
const convertToQuintals = (kg) => kg / 100; // 1 Quintal = 100 KG

// Function to process and convert measurements, filtering out nulls
const convertAndFilterMeasurements = (counts) => {
  // Helper function to process each offer
  const processOffer = (offer) => {
    const { quantity, measurement } = offer;

    // If measurement is null or undefined, we skip this offer
    if (!measurement) return null;

    // Convert quantity based on measurement type
    const quantityInKg = convertToKg(quantity, measurement);
    const quantityInQuintals = convertToQuintals(quantityInKg);

    // Return the offer with converted quantities
    return {
      ...offer,
      quantityInKg,
      quantityInQuintals,
    };
  };

  // Loop through all product categories in counts and process offers
  const convertedCounts = {};
  for (const [category, offers] of Object.entries(counts)) {
    const processedBuyOffers = offers.buy.map(processOffer).filter(Boolean); // Filter null offers
    const processedSellOffers = offers.sell.map(processOffer).filter(Boolean);

    convertedCounts[category] = {
      buy: processedBuyOffers,
      sell: processedSellOffers,
      total: [...processedBuyOffers, ...processedSellOffers],
    };
  }

  return convertedCounts;
};

export async function fetchAndProcessProducts() {
  try {
    // Fetch the data first
    const counts = await fetchPostedProducts();

    // Process the data to convert and filter the measurements
    const processedCounts = convertAndFilterMeasurements(counts);

    return processedCounts;
  } catch (error) {
    console.error("Error processing products:", error);
    throw error;
  }
}

export async function getTotalPostedProducts() {
  try {
    const counts = await fetchPostedProducts();

    let totalBuyOffers = 0;
    let totalSellOffers = 0;

    Object.values(counts).forEach((category) => {
      totalBuyOffers += category.buy.length;
      totalSellOffers += category.sell.length;
    });

    return {
      totalBuyOffers,
      totalSellOffers,
    };
  } catch (error) {
    console.error("Error getting total posted products:", error);
    throw error;
  }
}
