import React, { useEffect, useState } from "react";
import { getUsers } from "../../services/UserEngagementServ";
import { GrTransaction } from "react-icons/gr";
import { MdHdrEnhancedSelect, MdLocalOffer } from "react-icons/md";
import { PiUsersThreeFill } from "react-icons/pi";
import {
  fetchAllInteractionNumbers,
  getTotalPostedProducts,
  fetchAllInteraction,
} from "../../services/InteractionAndOffer";

function DashboardStatusGrid() {
  const [totalOffers, setTotalOffers] = useState({
    totalBuyOffers: 0,
    totalSellOffers: 0,
  });

  const [totalUsers, setTotalUser] = useState(1);
  const [totalInteraction, setTotalInteraction] = useState(1);
  const [averageGap, setAverageGap] = useState(null);

  const [avgUser, setAvgUser] = useState(null);
  const [avgAdmin, setAvgAdmin] = useState(null);
  const [avgTotal, setAvgTotal] = useState(null);
  const [avgDailyPerPost, setAvgDailyPerPost] = useState(null);

  useEffect(() => {
    const fetchTotalOffers = async () => {
      try {
        const response = await getTotalPostedProducts();
        setTotalOffers(response);
      } catch (error) {
        console.error("Error fetching total offers:", error);
      }
    };

    fetchTotalOffers();
  }, []);

  useEffect(() => {
    const fetchUserEngagement = async () => {
      try {
        const response = await getUsers();
        setTotalUser(response);
      } catch (error) {
        console.error("Error fetching user engagement data:", error);
      }
    };

    fetchUserEngagement();
  }, []);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const response = await fetchAllInteractionNumbers();
        setTotalInteraction(response);
      } catch (error) {
        console.error("Error fetching interaction data:", error);
      }
    };

    fetchInteractions();
  }, []);

  // Calculate Average Post-View Time Gap
  // Calculate Average Post-View Time Gap
  useEffect(() => {
    const calculateAverageTimeGap = async () => {
      try {
        const interactions = await fetchAllInteraction(); // Fetch all interactions

        // Filter out any interactions where offer is missing or created after the interaction
        const validInteractions = interactions.filter(
          (interaction) =>
            interaction.offer &&
            new Date(interaction.createdAt) >
              new Date(interaction.offer.createdAt)
        );

        const firstInteractions = validInteractions.reduce(
          (acc, interaction) => {
            if (!acc.some((item) => item.offerId === interaction.offerId)) {
              acc.push(interaction); // Keep the first interaction for this offerId
            }
            return acc;
          },
          []
        );

        let totalTimeGap = 0;
        let interactionCount = 0;

        firstInteractions.forEach((interaction) => {
          const interactionCreatedAt = new Date(interaction.createdAt);
          const offerCreatedAt = new Date(interaction.offer.createdAt);

          const timeGap = interactionCreatedAt - offerCreatedAt;
          const timeGapInDays = timeGap / (1000 * 60 * 60 * 24);

          totalTimeGap += timeGapInDays;
          interactionCount += 1;
        });

        const averageGapInDays =
          interactionCount > 0 ? totalTimeGap / interactionCount : 0;

        setAverageGap(averageGapInDays);
      } catch (error) {
        console.error("Error calculating average time gap:", error);
      }
    };

    calculateAverageTimeGap();
  }, []);

  useEffect(() => {
    const calculateInteractionAverages = async () => {
      try {
        const allInteractions = await fetchAllInteraction();

        const userOfferMap = new Map();
        const adminOfferMap = new Map();
        const totalOfferMap = new Map();

        // Define the minimum date threshold
        const thresholdDate = new Date("2024-12-24T09:13:46");

        for (const interaction of allInteractions) {
          const interactionDate = new Date(interaction.createdAt);
          if (interactionDate < thresholdDate) continue; // skip interactions before the threshold

          const offer = interaction.offer;
          if (!offer || !offer.id) continue;

          totalOfferMap.set(offer.id, (totalOfferMap.get(offer.id) || 0) + 1);

          if (offer.poster === "user") {
            userOfferMap.set(offer.id, (userOfferMap.get(offer.id) || 0) + 1);
          } else if (offer.poster === "admin") {
            adminOfferMap.set(offer.id, (adminOfferMap.get(offer.id) || 0) + 1);
          }
        }

        const calcAvg = (map) =>
          map.size > 0
            ? [...map.values()].reduce((a, b) => a + b, 0) / map.size
            : 0;

        setAvgUser(calcAvg(userOfferMap));
        setAvgAdmin(calcAvg(adminOfferMap));
        setAvgTotal(calcAvg(totalOfferMap));
      } catch (error) {
        console.error("Error calculating interaction averages:", error);
      }
    };

    calculateInteractionAverages();
  }, []);

  useEffect(() => {
    const calculateAvgDaily = async () => {
      try {
        const allInteractions = await fetchAllInteraction();
        const totalOfferMap = new Map();
        const createdAtMap = new Map();
        const now = new Date();

        // Build maps of: 1) total interactions per offer, 2) creation date per offer
        allInteractions.forEach((inter) => {
          const { offer } = inter;
          if (!offer || !offer.id) return;

          // record creation date once
          if (!createdAtMap.has(offer.id)) {
            createdAtMap.set(offer.id, new Date(offer.createdAt));
          }

          // count every interaction
          totalOfferMap.set(offer.id, (totalOfferMap.get(offer.id) || 0) + 1);
        });

        // for each offer, compute interactions ÷ days since posted
        const perDayRates = [];
        totalOfferMap.forEach((count, id) => {
          const created = createdAtMap.get(id);
          const daysActiveRaw = (now - created) / (1000 * 60 * 60 * 24);
          const daysActive = Math.max(daysActiveRaw, 1);
          perDayRates.push(count / daysActive);
        });

        // average those rates
        const avg =
          perDayRates.length > 0
            ? perDayRates.reduce((sum, v) => sum + v, 0) / perDayRates.length
            : 0;

        setAvgDailyPerPost(avg);
      } catch (err) {
        console.error("Error calculating avg daily views/post:", err);
      }
    };

    calculateAvgDaily();
  }, []);

  const totalPostedOffers =
    totalOffers.totalBuyOffers + totalOffers.totalSellOffers;

  return (
    <div className="w-full overflow-x-auto ">
      <div className="flex gap-4 w-full flex-nowrap">
        <BoxWrapper>
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-green-300">
            <MdLocalOffer className="text-2xl text-white" />
          </div>
          <div className="pl-4">
            <span className="text-m text-gray-600 font-light">
              Total Offers
            </span>
            <div className="flex items-center ">
              <strong className="text-2xl text-gray-700 font-bold">
                {totalPostedOffers}
              </strong>
            </div>
          </div>
        </BoxWrapper>
        <BoxWrapper>
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-sky-400">
            <PiUsersThreeFill className="text-2xl text-white" />
          </div>
          <div className="pl-4">
            <span className="text-m text-gray-600 font-light">
              Total Registered Users
            </span>
            <div className="flex items-center ">
              <strong className="text-2xl text-gray-700 font-bold">
                {totalUsers}
              </strong>
            </div>
          </div>
        </BoxWrapper>
        <BoxWrapper>
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-red-400">
            <GrTransaction className="text-2xl text-white" />
          </div>
          <div className="pl-4">
            <span className="text-m text-gray-600 font-light">
              Total Interactions{" "}
            </span>
            <div className="flex items-center ">
              <strong className="text-2xl text-gray-700 font-bold">
                {totalInteraction}
              </strong>
            </div>
          </div>
        </BoxWrapper>

        <BoxWrapper>
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-purple-400">
            <GrTransaction className="text-2xl text-white" />
          </div>
          <div className="pl-4">
            <span className="text-m text-gray-600 font-light">
              Average Post-View Time Gap
            </span>
            <div className="flex items-center ">
              <strong className="text-2xl text-gray-700 font-bold">
                {averageGap !== null
                  ? `${averageGap.toFixed(2)} Days`
                  : "Loading..."}
              </strong>
            </div>
          </div>
        </BoxWrapper>

        <BoxWrapper>
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-indigo-500">
            <GrTransaction className="text-2xl text-white" />
          </div>
          <div className="pl-4">
            <span className="text-m text-gray-600 font-light">
              Avg View/Post (User)
            </span>
            <div className="flex items-center ">
              <strong className="text-2xl text-gray-700 font-bold">
                {avgUser !== null ? avgUser.toFixed(2) : "Loading..."}
              </strong>
            </div>
          </div>
        </BoxWrapper>
        <BoxWrapper>
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-yellow-500">
            <GrTransaction className="text-2xl text-white" />
          </div>
          <div className="pl-4">
            <span className="text-m text-gray-600 font-light">
              Avg View/Post (Admin)
            </span>
            <div className="flex items-center ">
              <strong className="text-2xl text-gray-700 font-bold">
                {avgAdmin !== null ? avgAdmin.toFixed(2) : "Loading..."}
              </strong>
            </div>
          </div>
        </BoxWrapper>
        <BoxWrapper>
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-teal-500">
            <GrTransaction className="text-2xl text-white" />
          </div>
          <div className="pl-4">
            <span className="text-m text-gray-600 font-light">
              Avg View/Post (Total)
            </span>
            <div className="flex items-center ">
              <strong className="text-2xl text-gray-700 font-bold">
                {avgTotal !== null ? avgTotal.toFixed(2) : "Loading..."}
              </strong>
            </div>
          </div>
        </BoxWrapper>
        <BoxWrapper>
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-pink-400">
            <MdLocalOffer className="text-2xl text-white" />
          </div>
          <div className="pl-4">
            <span className="text-m text-gray-600 font-light">
              Avg Daily Views/Post
            </span>
            <div className="flex items-center">
              <strong className="text-2xl text-gray-700 font-bold">
                {avgDailyPerPost !== null
                  ? avgDailyPerPost.toFixed(2)
                  : "Loading..."}
              </strong>
            </div>
          </div>
        </BoxWrapper>
      </div>
    </div>
  );
}

export default DashboardStatusGrid;

function BoxWrapper({ children }) {
  return (
    <div className="bg-white rounded-sm p-4 flex-shrink-0 min-w-[250px] border-gray-200 flex items-center">
      {children}
    </div>
  );
}
