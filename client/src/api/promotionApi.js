import campaignApi from "./campaignApi";

const getPromotions = async (accessToken) => {
  const response = await campaignApi.getAllCampaigns({}, accessToken);
  const campaigns = response?.data || [];

  const promotions = campaigns.flatMap((campaign) =>
    (campaign.promotions || []).map((promotion) => ({
      ...promotion,
      campaign_id: promotion.campaign_id ?? campaign.campaign_id,
      campaign_name: campaign.name,
    })),
  );

  return {
    success: true,
    data: promotions,
  };
};

export default {
  getPromotions,
};
