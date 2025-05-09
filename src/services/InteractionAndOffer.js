import axios from "axios";

// Base URLs for different product categories
const fruitBaseUrl = "http://104.236.64.33:7050/api/fruit";
const pulseBaseUrl = "http://104.236.64.33:7050/api/pulse";
const spicesBaseUrl = "http://104.236.64.33:7050/api/spices";
const oilSeedBaseUrl = "http://104.236.64.33:7050/api/oilSeed";
const vegetableBaseUrl = "http://104.236.64.33:7050/api/vegetable";
const rootCropBaseUrl = "http://104.236.64.33:7050/api/rootCrop";
const buildingMaterialsBaseUrl =
  "http://104.236.64.33:7050/api/BuildingMaterials";
const grainsAndCerealsBaseUrl =
  "http://104.236.64.33:7050/api/GrainsandCerials";
const coffeeAndMainCommodityBaseUrl =
  "http://104.236.64.33:7050/api/CoffeeandMainCommodity";
const preferenceBaseUrl = "http://104.236.64.33:7050/api/Preference";

// const fruitBaseUrl = "http://localhost:7050/api/fruit";
// const pulseBaseUrl = "http://localhost:7050/api/pulse";
// const spicesBaseUrl = "http://localhost:7050/api/spices";
// const oilSeedBaseUrl = "http://localhost:7050/api/oilSeed";
// const vegetableBaseUrl = "http://localhost:7050/api/vegetable";
// const rootCropBaseUrl = "http://localhost:7050/api/rootCrop";
// const buildingMaterialsBaseUrl = "http://localhost:7050/api/BuildingMaterials";
// const grainsAndCerealsBaseUrl = "http://localhost:7050/api/GrainsandCerials";
// const coffeeAndMainCommodityBaseUrl =
//   "http://localhost:7050/api/CoffeeandMainCommodity";

// const preferenceBaseUrl = "http://localhost:7050/api/Preference";

export async function fetchCategories() {
  try {
    const response = await axios.get(`${preferenceBaseUrl}/categories`);
    // Adjust based on your API response shape:
    // If the API returns an object with a "categories" property:
    return Array.isArray(response.data)
      ? response.data
      : response.data.categories || [];
  } catch (error) {
    console.error("Error fetching category: ", error);
    return [];
  }
}

export async function fetchPostedProducts() {
  try {
    const [
      fruitsResponse,
      pulsesResponse,
      spicesResponse,
      oilSeedsResponse,
      vegetablesResponse,
      rootCropsResponse,
      buildingMaterialsResponse,
      grainsAndCerealsResponse,
      coffeeAndMainCommodityResponse,
    ] = await Promise.all([
      axios.get(`${fruitBaseUrl}/fetchAllOffers`),
      axios.get(`${pulseBaseUrl}/fetchAllOffers`),
      axios.get(`${spicesBaseUrl}/fetchAllOffers`),
      axios.get(`${oilSeedBaseUrl}/fetchAllOffers`),
      axios.get(`${vegetableBaseUrl}/fetchAllOffers`),
      axios.get(`${rootCropBaseUrl}/fetchAllOffers`),
      axios.get(`${buildingMaterialsBaseUrl}/fetchAllOffers`),
      axios.get(`${grainsAndCerealsBaseUrl}/fetchAllOffers`),
      axios.get(`${coffeeAndMainCommodityBaseUrl}/fetchAllOffers`),
    ]);

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
      fruits: processOffers(fruitsResponse.data),
      pulses: processOffers(pulsesResponse.data),
      spices: processOffers(spicesResponse.data),
      oilSeeds: processOffers(oilSeedsResponse.data),
      vegetables: processOffers(vegetablesResponse.data),
      rootCrops: processOffers(rootCropsResponse.data),
      buildingMaterials: processOffers(buildingMaterialsResponse.data),
      grainsAndCereals: processOffers(grainsAndCerealsResponse.data),
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

const interactionEndpoints = [
  `${fruitBaseUrl}/fetchAllInteraction`,
  `${pulseBaseUrl}/fetchAllInteraction`,
  `${spicesBaseUrl}/fetchAllInteraction`,
  `${oilSeedBaseUrl}/fetchAllInteraction`,
  `${vegetableBaseUrl}/fetchAllInteraction`,
  `${rootCropBaseUrl}/fetchAllInteraction`,
  `${buildingMaterialsBaseUrl}/fetchAllInteraction`,
  `${grainsAndCerealsBaseUrl}/fetchAllInteraction`,
  `${coffeeAndMainCommodityBaseUrl}/fetchAllInteraction`,
];

export async function fetchAllInteractionNumbers() {
  try {
    const interactionResponses = await Promise.all(
      interactionEndpoints.map((url) => axios.get(url))
    );

    const totalInteractions = interactionResponses.reduce((total, response) => {
      return total + (response.data.length || 0);
    }, 0);

    return totalInteractions;
  } catch (error) {
    console.error("Error fetching interactions:", error);
    throw error;
  }
}

export const fetchAllInteraction = async () => {
  try {
    const responses = await Promise.all(
      interactionEndpoints.map((url) => axios.get(url))
    );

    const allInteractions = responses.flatMap((response) => response.data);
    return allInteractions;
  } catch (error) {
    console.error("Error fetching interactions:", error);
    throw error;
  }
};

const baseUrls = {
  fruits: fruitBaseUrl,
  pulses: pulseBaseUrl,
  spices: spicesBaseUrl,
  oilSeeds: oilSeedBaseUrl,
  vegetables: vegetableBaseUrl,
  rootCrops: rootCropBaseUrl,
  buildingMaterials: buildingMaterialsBaseUrl,
  grainsAndCereals: grainsAndCerealsBaseUrl,
  coffeeAndMainCommodities: coffeeAndMainCommodityBaseUrl,
};

export async function fetchOfferById(offerId) {
  try {
    const offerPromises = Object.entries(baseUrls).map(
      async ([category, baseUrl]) => {
        try {
          const response = await axios.get(
            `${baseUrl}/fetchOffers?offerId=${offerId}`
          );
          return { category, offer: response.data };
        } catch (error) {
          console.error(
            `Error fetching offer for category ${category}:`,
            error
          );
          return null;
        }
      }
    );

    const offers = await Promise.all(offerPromises);
    const validOffers = offers.filter((offer) => offer !== null);

    if (validOffers.length === 0) {
      throw new Error("No offers found for the given offerId");
    }

    return validOffers;
  } catch (error) {
    console.error("Error fetching offer by ID:", error);
    throw error;
  }
}

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
    const fruitCounts = await fetchProductInteractionCount(fruitBaseUrl);
    const pulseCounts = await fetchProductInteractionCount(pulseBaseUrl);
    const spicesCounts = await fetchProductInteractionCount(spicesBaseUrl);
    const oilSeedCounts = await fetchProductInteractionCount(oilSeedBaseUrl);
    const vegetableCounts = await fetchProductInteractionCount(
      vegetableBaseUrl
    );
    const rootCropCounts = await fetchProductInteractionCount(rootCropBaseUrl);
    const buildingMaterialsCounts = await fetchProductInteractionCount(
      buildingMaterialsBaseUrl
    );
    const grainsAndCerealsCounts = await fetchProductInteractionCount(
      grainsAndCerealsBaseUrl
    );
    const coffeeAndMainCommodityCounts = await fetchProductInteractionCount(
      coffeeAndMainCommodityBaseUrl
    );

    return {
      fruitCounts,
      pulseCounts,
      spicesCounts,
      oilSeedCounts,
      vegetableCounts,
      rootCropCounts,
      buildingMaterialsCounts,
      grainsAndCerealsCounts,
      coffeeAndMainCommodityCounts,
    };
  } catch (error) {
    console.error("Error fetching all product interaction counts:", error);
    throw error;
  }
};

const categoryUrls = {
  "Coffee / ቡና": "http://104.236.64.33:7050/api/CoffeeandMainCommodity",
  "Spice & Herbs / ቅመማ ቅመሞቾ": "http://104.236.64.33:7050/api/spices",
  "Building Materials / የግንባታ እቃዎች":
    "http://104.236.64.33:7050/api/BuildingMaterials",
  "Grains and Cereals / የእህል ሰብሎች":
    "http://104.236.64.33:7050/api/GrainsandCerials",
  "Pulses & Legumes / ጥራጥሬዎች ": "http://104.236.64.33:7050/api/pulse",
  "Oil Seeds / የቅባት እህሎች": "http://104.236.64.33:7050/api/oilSeed",
  "Root Crops / የስራስር ሰብሎች": "http://104.236.64.33:7050/api/rootCrop",
  "Vegetables  / አትክልቶች": "http://104.236.64.33:7050/api/vegetable",
  "Fruit Crops / ፍራፍሬች": "http://104.236.64.33:7050/api/fruit",
};
export const getAllProductNames = async (selectedCategory) => {
  try {
    const baseUrl = categoryUrls[selectedCategory];
    if (!baseUrl) {
      throw new Error(`No URL found for category: ${selectedCategory}`);
    }
    const response = await axios.get(`${baseUrl}/fetchProduct`);
    const productNames = response.data.map((product) => product.name);
    return productNames;
  } catch (error) {
    console.error(
      "Error fetching product names for category:",
      selectedCategory,
      error
    );
    throw error;
  }
};
