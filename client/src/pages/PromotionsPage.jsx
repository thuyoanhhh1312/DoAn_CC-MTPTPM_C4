import React, { useEffect, useState } from "react";
import { Empty, Input, Progress, Spin, Tag as AntTag } from "antd";
import { Check, Copy, Tag } from "lucide-react";
import MainLayout from "@/layout/MainLayout";
import promotionApi from "@/api/promotionApi";
import Swal from "sweetalert2";

const segmentMap = {
  birthday: { label: "Sinh nhật" },
  vip: { label: "VIP" },
  gold: { label: "Gold" },
  silver: { label: "Silver" },
  bronze: { label: "Bronze" },
};

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);

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

      const activePromotions = (response.data || []).filter(
        (promo) => !promo.usage_limit || promo.usage_count < promo.usage_limit,
      );

      setPromotions(activePromotions);
    } catch (error) {
      Swal.fire(
        "Lỗi",
        "Không thể tải danh sách khuyến mãi\n\n" +
          (error.response?.data?.message || error.message),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredPromotions = promotions.filter(
    (promo) =>
      promo.promotion_code
        .toLowerCase()
        .includes(searchKeyword.toLowerCase()) ||
      (promo.description &&
        promo.description.toLowerCase().includes(searchKeyword.toLowerCase())),
  );

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-8">
        <div className="mb-12 scroll-mt-24 text-center">
          <h1 className="mb-3 font-heading text-3xl font-bold text-gray-800 sm:text-4xl">
            Khuyến mãi
          </h1>
          <div className="divider-gold mx-auto mb-4 max-w-[80px]" />
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            Khám phá những chương trình khuyến mãi hấp dẫn dành cho bạn
          </p>
        </div>

        <div className="mb-8 rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Tìm kiếm khuyến mãi
          </h3>
          <Input
            placeholder="Tìm theo mã khuyến mãi hoặc mô tả..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            size="large"
            prefix={<Tag size={18} className="text-gray-400" />}
            allowClear
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spin size="large" tip="Đang tải khuyến mãi..." />
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="py-16">
            <Empty
              description={
                searchKeyword
                  ? "Không tìm thấy khuyến mãi"
                  : "Hiện không có khuyến mãi nào"
              }
              style={{ color: "#999" }}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredPromotions.map((promotion) => {
                const segment = segmentMap[promotion.segment_target];
                const isCopied = copiedCode === promotion.promotion_code;
                const usageCount = Number(promotion.usage_count ?? 0);
                const usageLimit = Number(promotion.usage_limit ?? 0);
                const usagePercent =
                  usageLimit > 0
                    ? Math.round((usageCount / usageLimit) * 100)
                    : 0;

                return (
                  <div
                    key={promotion.promotion_id}
                    className="flex h-full flex-col rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 transition-all duration-300 hover:border-amber-400 hover:shadow-lg"
                  >
                    <div className="flex flex-1 flex-col">
                      <div className="mb-3">
                        <div className="mb-1 text-sm font-semibold text-gray-600">
                          Mã khuyến mãi
                        </div>
                        <div className="rounded-lg border border-amber-300 bg-white p-2 text-center font-mono font-bold text-amber-700">
                          {promotion.promotion_code}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-2xl font-bold text-amber-600">
                          -{promotion.discount}%
                        </div>
                      </div>

                      <div className="mb-3 min-h-[32px]">
                        {segment && (
                          <AntTag color="gold" className="capitalize">
                            {segment.label}
                          </AntTag>
                        )}
                      </div>

                      <p className="mb-4 min-h-[3rem] text-sm leading-6 text-gray-600 line-clamp-2">
                        {promotion.description || "\u00A0"}
                      </p>

                      <div className="mb-4 min-h-[60px]">
                        {usageLimit > 0 && (
                          <>
                            <div className="mb-1 flex justify-between text-xs text-gray-500">
                              <span>
                                Sử dụng: {usageCount}/{usageLimit}
                              </span>
                              <span>{usagePercent}%</span>
                            </div>
                            <Progress
                              percent={usagePercent}
                              size="small"
                              showInfo={false}
                              status={
                                usageCount >= usageLimit ? "exception" : "normal"
                              }
                            />
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyCode(promotion.promotion_code)}
                      className={`mt-auto flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-white transition-all ${
                        isCopied
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gold-gradient hover:shadow-elegant"
                      }`}
                    >
                      {isCopied ? <Check size={16} /> : <Copy size={16} />}
                      {isCopied ? "Đã sao chép!" : "Sao chép mã"}
                    </button>

                    {promotion.created_at && (
                      <div className="mt-3 text-center text-xs text-gray-400">
                        Ngày tạo:{" "}
                        {new Date(promotion.created_at).toLocaleDateString(
                          "vi-VN",
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center text-gray-600">
              <p className="text-sm">
                Hiển thị{" "}
                <span className="font-semibold text-amber-600">
                  {filteredPromotions.length}
                </span>{" "}
                khuyến mãi
                {searchKeyword
                  ? ` khớp với "${searchKeyword}"`
                  : " đang hoạt động"}
              </p>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default PromotionsPage;
