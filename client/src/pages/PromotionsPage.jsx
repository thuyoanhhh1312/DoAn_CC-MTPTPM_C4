import React, { useState, useEffect } from 'react';
import { Spin, Empty, Button, Space, Input } from 'antd';
import { Copy, Check, Gift, Tag, Users } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import promotionApi from '@/api/promotionApi';
import Swal from 'sweetalert2';

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // Fetch promotions
  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await promotionApi.getAllPromotions({
        page: 1,
        limit: 50,
      });
      console.log('Promotions API Response:', response);
      // Filter out inactive promotions (usage limit exceeded)
      const activePromotions = (response.data || []).filter(
        (promo) => !promo.usage_limit || promo.usage_count < promo.usage_limit
      );
      console.log('Active promotions:', activePromotions);
      setPromotions(activePromotions);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      console.error('Error details:', error.response?.data || error.message);
      Swal.fire('Lỗi', 'Không thể tải danh sách khuyến mãi\n\n' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter promotions by search keyword
  const filteredPromotions = promotions.filter(
    (promo) =>
      promo.promotion_code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (promo.description && promo.description.toLowerCase().includes(searchKeyword.toLowerCase()))
  );

  // Copy code to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Segment label map
  const segmentMap = {
    birthday: { label: 'Sinh nhật', icon: '🎂', color: 'from-pink-400 to-pink-500' },
    vip: { label: 'VIP', icon: '👑', color: 'from-yellow-400 to-yellow-500' },
    gold: { label: 'Gold', icon: '🏆', color: 'from-amber-400 to-amber-500' },
    silver: { label: 'Silver', icon: '⭐', color: 'from-gray-300 to-gray-400' },
    bronze: { label: 'Bronze', icon: '🥉', color: 'from-orange-400 to-orange-500' },
  };

  return (
    <MainLayout>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12 scroll-mt-24">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Khuyến mãi
          </h1>
          <div className="divider-gold max-w-[80px] mx-auto mb-4" />
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Khám phá những chương trình khuyến mãi hấp dẫn dành cho bạn
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tìm kiếm khuyến mãi</h3>
          <Input
            placeholder="Tìm theo mã khuyến mãi hoặc mô tả..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            size="large"
            prefix={<Tag size={18} className="text-gray-400" />}
            allowClear
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin size="large" tip="Đang tải khuyến mãi..." />
          </div>
        ) : /* No Promotions */
        filteredPromotions.length === 0 ? (
          <div className="py-16">
            <Empty
              description={searchKeyword ? 'Không tìm thấy khuyến mãi' : 'Hiện không có khuyến mãi nào'}
              style={{ color: '#999' }}
            />
          </div>
        ) : (
          <>
            {/* Promotions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPromotions.map((promotion) => {
                const segment = segmentMap[promotion.segment_target];
                const isCopied = copiedCode === promotion.promotion_code;

                return (
                  <div
                    key={promotion.promotion_id}
                    className="group h-full bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-amber-300"
                  >
                    {/* Header with Discount */}
                    <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 p-6 pb-8">
                      {/* Discount Badge */}
                      <div className="absolute top-4 right-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full w-20 h-20 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{promotion.discount}%</div>
                          <div className="text-xs text-red-100">Off</div>
                        </div>
                      </div>

                      {/* Promotion Code */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                            {promotion.promotion_code}
                          </div>
                        </div>

                        {/* Segment Badge */}
                        {segment && (
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${segment.color} text-white text-sm font-medium`}>
                            <span>{segment.icon}</span>
                            <span>{segment.label}</span>
                          </div>
                        )}

                        {!segment && (
                          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
                            <Users size={16} />
                            <span>Tất cả khách hàng</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Description */}
                      {promotion.description && (
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                          {promotion.description}
                        </p>
                      )}

                      {/* Usage Stats */}
                      {promotion.usage_limit && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-600 font-medium">Số lượng còn lại</span>
                            <span className="text-xs font-semibold text-gray-800">
                              {promotion.usage_limit - promotion.usage_count}/{promotion.usage_limit}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                promotion.usage_count >= promotion.usage_limit * 0.8
                                  ? 'bg-red-500'
                                  : promotion.usage_count >= promotion.usage_limit * 0.5
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{
                                width: `${
                                  promotion.usage_limit > 0
                                    ? Math.min(
                                        (promotion.usage_count / promotion.usage_limit) * 100,
                                        100
                                      )
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Copy Button */}
                      <Button
                        block
                        size="large"
                        type="primary"
                        onClick={() => handleCopyCode(promotion.promotion_code)}
                        className={`transition-all font-semibold ${
                          isCopied
                            ? 'bg-green-500 border-green-500 hover:bg-green-600'
                            : 'bg-amber-500 border-amber-500 hover:bg-amber-600'
                        }`}
                        icon={isCopied ? <Check size={18} /> : <Copy size={18} />}
                      >
                        {isCopied ? 'Đã sao chép!' : 'Sao chép mã'}
                      </Button>

                      {/* Date */}
                      {promotion.created_at && (
                        <div className="mt-3 text-center text-xs text-gray-400">
                          Ngày tạo: {new Date(promotion.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Results Summary */}
            <div className="mt-8 text-center text-gray-600">
              <p className="text-sm">
                Hiển thị <span className="font-semibold text-amber-600">{filteredPromotions.length}</span> khuyến mãi
                {searchKeyword ? ` khớp với "${searchKeyword}"` : ' đang hoạt động'}
              </p>
            </div>
          </>
        )}

        {/* Promotions Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <Gift className="text-blue-600 mb-3" size={32} />
            <h4 className="font-semibold text-gray-800 mb-2">Mã khuyến mãi độc quyền</h4>
            <p className="text-sm text-gray-600">
              Sao chép mã khuyến mãi và áp dụng khi thanh toán để nhận ưu đãi
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <Users className="text-green-600 mb-3" size={32} />
            <h4 className="font-semibold text-gray-800 mb-2">Khuyến mãi theo đối tượng</h4>
            <p className="text-sm text-gray-600">
              Một số khuyến mãi chỉ áp dụng cho khách hàng VIP, sinh nhật, hay các hạng khác
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <Tag className="text-purple-600 mb-3" size={32} />
            <h4 className="font-semibold text-gray-800 mb-2">Số lượng có giới hạn</h4>
            <p className="text-sm text-gray-600">
              Một số khuyến mãi có giới hạn số lần sử dụng, hãy nhanh tay để không bỏ lỡ
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PromotionsPage;
