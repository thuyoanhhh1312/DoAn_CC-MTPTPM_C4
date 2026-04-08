import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Input,
  Radio,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import { ArrowLeft, MailCheck, Search } from "lucide-react";
import PageContainer from "../../components/common/PageContainer";
import campaignApi from "../../api/campaignApi";
import customerApi from "../../api/customerApi";
import promotionApi from "../../api/promotionApi";
import promotionLogApi from "../../api/promotionLogApi";

const { Text } = Typography;

const PromotionLogSendPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => ({ ...state }));
  const [messageApi, contextHolder] = message.useMessage();

  const [mode, setMode] = useState("promotion");
  const [campaigns, setCampaigns] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [emailKeyword, setEmailKeyword] = useState("");
  const [promotionId, setPromotionId] = useState(undefined);
  const [campaignId, setCampaignId] = useState(undefined);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [forceResend, setForceResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.token) return;

    const bootstrap = async () => {
      setLoadingData(true);
      setError("");
      try {
        const [campaignResponse, promotionResponse] = await Promise.all([
          campaignApi.getAllCampaigns({}, user?.token),
          promotionApi.getPromotions(user?.token),
        ]);
        setCampaigns(campaignResponse?.data || []);
        setPromotions(promotionResponse?.data || []);
      } catch (apiError) {
        console.error("Error loading promotion log form data:", apiError);
        setError(
          apiError?.response?.data?.message ||
            "Không thể tải dữ liệu chiến dịch và khuyến mãi.",
        );
      } finally {
        setLoadingData(false);
      }
    };

    bootstrap();
  }, [user?.token]);

  useEffect(() => {
    if (!user?.token) return;

    const timeout = setTimeout(async () => {
      setLoadingCustomers(true);
      try {
        const response = await customerApi.getCustomerEmails(
          emailKeyword,
          user?.token,
        );
        setCustomers(response || []);
      } catch (apiError) {
        console.error("Error loading customer emails:", apiError);
      } finally {
        setLoadingCustomers(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [emailKeyword, user?.token]);

  const promotionOptions = useMemo(
    () =>
      promotions.map((promotion) => ({
        label: `${promotion.promotion_code} - Giảm ${promotion.discount}%`,
        value: promotion.promotion_id,
        campaignName: promotion.campaign_name,
        segmentTarget: promotion.segment_target,
      })),
    [promotions],
  );

  const customerOptions = useMemo(
    () =>
      customers.map((customer) => ({
        label: (
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">{customer.email}</span>
              <span className="text-xs text-gray-500">{customer.name}</span>
            </div>
            <Tag color="gold">{(customer.segment_type || "none").toUpperCase()}</Tag>
          </div>
        ),
        value: customer.customer_id ?? customer.id,
        searchText: `${customer.email || ""} ${customer.name || ""} ${customer.segment_type || ""}`.toLowerCase(),
      })),
    [customers],
  );

  const selectedPromotion = promotions.find(
    (promotion) => Number(promotion.promotion_id) === Number(promotionId),
  );
  const selectedCampaign = campaigns.find(
    (campaign) => Number(campaign.campaign_id) === Number(campaignId),
  );

  const handleSubmit = async () => {
    if (mode === "promotion" && !promotionId) {
      messageApi.warning("Vui lòng chọn một mã khuyến mãi để gửi.");
      return;
    }

    if (mode === "campaign" && !campaignId) {
      messageApi.warning("Vui lòng chọn một campaign để gửi.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        force_resend: forceResend,
      };

      if (selectedCustomerIds.length > 0) {
        payload.customer_ids = selectedCustomerIds;
      }

      if (mode === "promotion") {
        payload.promotion_id = Number(promotionId);
      } else {
        payload.campaign_id = Number(campaignId);
      }

      const response = await promotionLogApi.sendPromotionManually(
        payload,
        user?.token,
      );
      const summary = response?.summary || {};

      messageApi.success(
        `Gửi xong. Sent: ${summary.sent || 0}, skipped: ${summary.skipped || 0}, failed: ${summary.failed || 0}.`,
      );
      navigate("/admin/promotion-logs");
    } catch (apiError) {
      console.error("Error sending promotion manually:", apiError);
      messageApi.error(
        apiError?.response?.data?.message ||
          "Không thể gửi khuyến mãi thủ công.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="Gửi khuyến mãi thủ công"
      subtitle="Chọn theo promotion hoặc campaign, giới hạn danh sách khách hàng nếu cần, rồi gửi trực tiếp từ trang quản trị."
      actions={[
        <Button
          key="back"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate("/admin/promotion-logs")}
        >
          Quay lại log
        </Button>,
      ]}
    >
      {contextHolder}

      {error ? (
        <Alert
          className="mb-6"
          type="error"
          showIcon
          message="Không thể tải dữ liệu"
          description={error}
        />
      ) : null}

      <Card className="shadow-sm">
        <div className="space-y-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Để trống danh sách khách hàng nếu bạn muốn backend tự xác định nhóm nhận theo segment của promotion hoặc campaign.
          </div>

          <div>
            <Text strong>Chế độ gửi</Text>
            <div className="mt-3">
              <Radio.Group value={mode} onChange={(event) => setMode(event.target.value)}>
                <Space direction="vertical">
                  <Radio value="promotion">Gửi theo mã khuyến mãi</Radio>
                  <Radio value="campaign">Gửi theo campaign</Radio>
                </Space>
              </Radio.Group>
            </div>
          </div>

          {mode === "promotion" ? (
            <div>
              <Text strong>Chọn promotion</Text>
              <Select
                className="mt-2 w-full"
                showSearch
                loading={loadingData}
                placeholder="Chọn mã khuyến mãi"
                value={promotionId}
                onChange={setPromotionId}
                optionFilterProp="label"
                options={promotionOptions}
              />
              {selectedPromotion ? (
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  <div>Mã: <strong>{selectedPromotion.promotion_code}</strong></div>
                  <div>Giảm giá: <strong>{selectedPromotion.discount}%</strong></div>
                  <div>Campaign: <strong>{selectedPromotion.campaign_name || "Không có"}</strong></div>
                  <div>Segment: <strong>{selectedPromotion.segment_target || "Tất cả"}</strong></div>
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <Text strong>Chọn campaign</Text>
              <Select
                className="mt-2 w-full"
                showSearch
                loading={loadingData}
                placeholder="Chọn campaign"
                value={campaignId}
                onChange={setCampaignId}
                optionFilterProp="label"
                options={(campaigns || []).map((campaign) => ({
                  label: campaign.name,
                  value: campaign.campaign_id,
                }))}
              />
              {selectedCampaign ? (
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  <div>Tên chiến dịch: <strong>{selectedCampaign.name}</strong></div>
                  <div>
                    Số promotion: <strong>{selectedCampaign.promotions?.length || 0}</strong>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <div>
            <Text strong>Giới hạn khách hàng nhận mail</Text>
            <Input
              className="mt-2"
              allowClear
              placeholder="Tìm khách hàng theo tên hoặc email"
              prefix={<Search size={16} />}
              value={emailKeyword}
              onChange={(event) => setEmailKeyword(event.target.value)}
            />
            <Select
              className="mt-3 w-full"
              mode="multiple"
              allowClear
              showSearch
              loading={loadingCustomers}
              placeholder="Chọn khách hàng cụ thể nếu muốn"
              value={selectedCustomerIds}
              onChange={setSelectedCustomerIds}
              onSearch={setEmailKeyword}
              options={customerOptions}
              filterOption={(input, option) =>
                (option?.searchText || "").includes((input || "").toLowerCase())
              }
              maxTagCount="responsive"
            />
          </div>

          <div>
            <Checkbox
              checked={forceResend}
              onChange={(event) => setForceResend(event.target.checked)}
            >
              Gửi lại ngay cả khi khách hàng đã có log gửi trước đó
            </Checkbox>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="primary"
              loading={loading}
              icon={<MailCheck size={16} />}
              onClick={handleSubmit}
            >
              Gửi khuyến mãi
            </Button>
            <Button onClick={() => navigate("/admin/promotion-logs")}>
              Hủy
            </Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default PromotionLogSendPage;
