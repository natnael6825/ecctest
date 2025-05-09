import React, { useEffect, useState } from "react";
import { getUsers } from "../../services/UserEngagementServ";
import { GrTransaction } from "react-icons/gr";
import { MdHdrEnhancedSelect, MdLocalOffer } from "react-icons/md";
import { PiUsersThreeFill } from "react-icons/pi";
import {
  fetchAllInteractionNumbers,
  getTotalPostedProducts,
  fetchAllInteraction,
} from "../../services/BuildingMaterials";

function DashboardStatusGrid() {
  const [totalOffers, setTotalOffers] = useState({
    totalBuyOffers: 0,
    totalSellOffers: 0,
  });

  const [totalUsers, setTotalUser] = useState(1);
  const [totalInteraction, setTotalInteraction] = useState(1);
  const [averageGap, setAverageGap] = useState(null);

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
        console.log("INT:", interactions);
        const firstInteractions = interactions.reduce((acc, interaction) => {
          // Check if the offerId is already in the accumulator
          if (!acc.some((item) => item.offerId === interaction.offerId)) {
            acc.push(interaction); // Keep the first interaction for this offerId
          }
          return acc; // Return the accumulator for the next iteration
        }, []);

        // Initialize variables to calculate the time gap
        let totalTimeGap = 0; // This will be in days
        let interactionCount = 0;

        firstInteractions.forEach((interaction) => {
          if (interaction.offer) {
            const interactionCreatedAt = new Date(interaction.createdAt);
            const offerCreatedAt = new Date(interaction.offer.createdAt);

            // Calculate the time gap in milliseconds
            const timeGap = interactionCreatedAt - offerCreatedAt;

            // Convert time gap to days
            const timeGapInDays = timeGap / (1000 * 60 * 60 * 24); // Convert to days

            totalTimeGap += timeGapInDays; // Add to total time gap in days
            interactionCount += 1;
          } else {
            console.warn("No offer found for interaction:", interaction);
          }
        });

        // Log the values after the iteration is done

        // Calculate the average time gap in days
        const averageGapInDays =
          interactionCount > 0 ? totalTimeGap / interactionCount : 0;

        setAverageGap(averageGapInDays);
      } catch (error) {
        console.error("Error calculating average time gap:", error);
      }
    };

    calculateAverageTimeGap();
  }, []);

  const totalPostedOffers =
    totalOffers.totalBuyOffers + totalOffers.totalSellOffers;

  return (
    <div className="flex gap-4 w-full">
      <BoxWrapper>
        <div className="rounded-full h-12 w-12 flex items-center justify-center bg-green-300">
          <MdLocalOffer className="text-2xl text-white" />
        </div>
        <div className="pl-4">
          <span className="text-m text-gray-600 font-light">Total Offers</span>
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
    </div>
  );
}

export default DashboardStatusGrid;

function BoxWrapper({ children }) {
  return (
    <div className="bg-white rounded-sm p-4 flex-1 border-gray-200 flex items-center">
      {children}
    </div>
  );
}
