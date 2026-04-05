import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Stack,
    Chip,
    Divider,
    CircularProgress,
    Rating,
    Grid
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import productApi from "../api/productApi";

const goldColor = "#C48C46";
const grayBg = "#f9f9f9";
const defaultKeywords = [
    "Bông tai", "Mặt dây chuyền", "Lắc - Vòng tay", "Dây chuyền", "Nhẫn", "Charm"
];

const defaultHotProducts = [
    { name: "Dây chuyền vàng", price: 22560000, image: "https://cdn.pnj.io/images/logo/pnj.com.vn.png" },
    { name: "Dây chuyền vàng", price: 36774000, image: "https://cdn.pnj.io/images/logo/pnj.com.vn.png" },
    { name: "Nhẫn kim cương", price: 19900000, image: "https://cdn.pnj.io/images/logo/pnj.com.vn.png" },
    { name: "Vòng tay vàng", price: 39030000, image: "https://cdn.pnj.io/images/logo/pnj.com.vn.png" },
    { name: "Đồng hồ", price: 5280000, image: "https://cdn.pnj.io/images/logo/pnj.com.vn.png" },
];

const QuickSearchResults = ({
    searchText,
    hotProducts = [],
    noResult,
    searching,
    onSelectKeyword,
    onClose
}) => {
    const navigate = useNavigate();
    const [topProducts, setTopProduct] = useState([]);

    const goProductDetail = (product) => {
        navigate(`/${product.slug}`);
        if (onClose) onClose();
    };

    const fetchTopRatedProducts = async () => {
        try {
            const data = await productApi.getTopRatedProductsBySentiment();
            setTopProduct(data.products || []);
        } catch (error) {
            console.error("Lỗi lấy sản phẩm đánh giá tốt:", error);
        }
    };

    useEffect(() => {
        fetchTopRatedProducts();
    }, []);

    if (!searchText.trim()) {
        return (
            <Box
                sx={{
                    mt: 2,
                    mx: 4,
                    mb: 3,
                    background: grayBg,
                    borderRadius: '18px',
                    boxShadow: '0 2px 18px rgba(100,100,100,0.07)',
                    p: { xs: 2, sm: 4 },
                    maxHeight: '62vh',
                    overflowY: 'auto',
                }}
            >
                <Typography variant="subtitle1" fontWeight={700}>Top tìm kiếm</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                    {defaultKeywords.map((keyword, idx) => (
                        <Chip
                            key={idx}
                            label={keyword}
                            variant="outlined"
                            color="primary"
                            clickable
                            onClick={() => onSelectKeyword(keyword)}
                            sx={{
                                borderColor: goldColor,
                                color: "#444",
                                fontWeight: 500,
                                background: "#fff",
                                mb: 0.5,
                                "&:hover": { bgcolor: "#fffbe7" }
                            }}
                        />
                    ))}
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight={700} mt={2}>Sản phẩm đánh giá tốt nhất</Typography>
                {topProducts.map((prod, idx) => {
                    const ratingValue = prod.avg_rating
                        ? Number(prod.avg_rating).toFixed(1)
                        : 0;

                    return (
                        <Box
                            key={prod.product_id}
                            onClick={() => goProductDetail(prod)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                py: 2,
                                px: 1,
                                cursor: "pointer",
                                borderBottom:
                                    idx !== hotProducts.length - 1
                                        ? "1px solid rgba(0,0,0,0.1)"
                                        : "none",
                                "&:hover": {
                                    backgroundColor: "#fffbe7",
                                },
                            }}
                        >
                            <Box
                                component="img"
                                src={
                                    prod.ProductImages?.[0]?.image_url ||
                                    "https://cdn.pnj.io/images/logo/pnj.com.vn.png"
                                }
                                alt={prod.product_name}
                                sx={{
                                    width: 64,
                                    height: 64,
                                    objectFit: "contain",
                                    borderRadius: 2,
                                    boxShadow: "0 2px 6px #eee",
                                    mr: 2,
                                    flexShrink: 0,
                                }}
                            />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography
                                    variant="body1"
                                    fontWeight={600}
                                    color="#222"
                                    sx={{ mb: 0.3 }}
                                >
                                    {prod.product_name}
                                </Typography>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                    sx={{ mb: 0.3 }}
                                >
                                    <Rating
                                        value={Number(ratingValue)}
                                        precision={0.1}
                                        readOnly
                                        size="small"
                                        sx={{ color: goldColor }}
                                    />
                                    <Typography
                                        variant="body2"
                                        color="#555"
                                        sx={{ fontWeight: 500 }}
                                    >
                                        {ratingValue}
                                    </Typography>
                                </Stack>
                                <Typography color={goldColor} fontWeight={700}>
                                    {prod.price?.toLocaleString()} ₫
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        );
    }

    // Loading khi đang search
    if (searching) {
        return (
            <Box
                sx={{
                    mt: 2, mx: 4, mb: 3, minHeight: "180px",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    background: grayBg, borderRadius: '18px',
                }}
            >
                <CircularProgress sx={{ color: goldColor, mb: 2 }} />
                <Typography color="#888">Đang tìm kiếm sản phẩm...</Typography>
            </Box>
        );
    }

    // Không có kết quả
    if (noResult) {
        return (
            <Box
                sx={{
                    mt: 2, mx: 4, mb: 3, minHeight: "180px",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    background: grayBg, borderRadius: '18px',
                }}
            >
                <img
                    src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
                    alt="Không có sản phẩm"
                    style={{ width: 70, marginBottom: 16, opacity: 0.8 }}
                />
                <Typography color="#888" fontWeight={500} fontSize={18}>
                    Không tìm thấy sản phẩm phù hợp
                </Typography>
                <Typography color="#aaa" fontSize={14} mt={1}>
                    Vui lòng thử từ khóa khác.
                </Typography>
            </Box>
        );
    }

    // Có kết quả sản phẩm từ API
    return (
        <Box
            sx={{
                mt: 2,
                mx: 4,
                mb: 3,
                background: grayBg,
                borderRadius: "18px",
                boxShadow: "0 2px 18px rgba(100,100,100,0.07)",
                p: { xs: 2, sm: 4 },
                maxHeight: "62vh",
                overflowY: "auto",
            }}
        >
            <Typography variant="subtitle1" fontWeight={700} mt={2} mb={2}>
                Kết quả tìm kiếm
            </Typography>

            {hotProducts.map((prod, idx) => {
                const ratingValue = prod.avg_rating
                    ? Number(prod.avg_rating).toFixed(1)
                    : 0;

                return (
                    <Box
                        key={prod.product_id}
                        onClick={() => goProductDetail(prod)}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            py: 2,
                            px: 1,
                            cursor: "pointer",
                            borderBottom:
                                idx !== hotProducts.length - 1
                                    ? "1px solid rgba(0,0,0,0.1)"
                                    : "none",
                            "&:hover": {
                                backgroundColor: "#fffbe7",
                            },
                        }}
                    >
                        <Box
                            component="img"
                            src={
                                prod.ProductImages?.[0]?.image_url ||
                                "https://cdn.pnj.io/images/logo/pnj.com.vn.png"
                            }
                            alt={prod.product_name}
                            sx={{
                                width: 64,
                                height: 64,
                                objectFit: "contain",
                                borderRadius: 2,
                                boxShadow: "0 2px 6px #eee",
                                mr: 2,
                                flexShrink: 0,
                            }}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography
                                variant="body1"
                                fontWeight={600}
                                color="#222"
                                sx={{ mb: 0.3 }}
                            >
                                {prod.product_name}
                            </Typography>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{ mb: 0.3 }}
                            >
                                <Rating
                                    value={Number(ratingValue)}
                                    precision={0.1}
                                    readOnly
                                    size="small"
                                    sx={{ color: goldColor }}
                                />
                                <Typography
                                    variant="body2"
                                    color="#555"
                                    sx={{ fontWeight: 500 }}
                                >
                                    {ratingValue}
                                </Typography>
                            </Stack>
                            <Typography color={goldColor} fontWeight={700}>
                                {prod.price?.toLocaleString()} ₫
                            </Typography>
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};

export default QuickSearchResults;