import Promotion from "../models/promotion.js";

// Create sample promotions
const samplePromotions = [
  {
    promotion_code: 'SUMMER2024',
    campaign_id: null,
    segment_target: null,
    discount: 15,
    description: 'Giảm 15% cho mọi khách hàng - Chương trình hè 2024',
    usage_limit: null,
    usage_count: 0,
  },
  {
    promotion_code: 'BIRTHDAY30',
    campaign_id: null,
    segment_target: 'birthday',
    discount: 30,
    description: 'Đặc biệt dành cho khách hàng có sinh nhật - Giảm 30%',
    usage_limit: 100,
    usage_count: 5,
  },
  {
    promotion_code: 'VIP50',
    campaign_id: null,
    segment_target: 'vip',
    discount: 50,
    description: 'Ưu đãi VIP - Giảm tới 50% cho các giao dịch tiếp theo',
    usage_limit: null,
    usage_count: 0,
  },
  {
    promotion_code: 'GOLD25',
    campaign_id: null,
    segment_target: 'gold',
    discount: 25,
    description: 'Khách hàng Gold - Giảm 25% để tri ân sự tin tưởng',
    usage_limit: 500,
    usage_count: 245,
  },
  {
    promotion_code: 'SILVER15',
    campaign_id: null,
    segment_target: 'silver',
    discount: 15,
    description: 'Khách hàng Silver - Giảm 15%',
    usage_limit: 200,
    usage_count: 120,
  },
  {
    promotion_code: 'BRONZE10',
    campaign_id: null,
    segment_target: 'bronze',
    discount: 10,
    description: 'Khách hàng Bronze - Giảm 10%',
    usage_limit: 300,
    usage_count: 180,
  },
];

async function seedPromotions() {
  try {
    // Check existing promotions
    const existingCount = await Promotion.count();
    console.log(`Existing promotions: ${existingCount}`);

    if (existingCount === 0) {
      console.log('Seeding sample promotions...');
      await Promotion.bulkCreate(samplePromotions);
      console.log('✅ Sample promotions created successfully!');
    } else {
      console.log('✅ Promotions already exist. Skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding promotions:', error);
  }
}

export default seedPromotions;
