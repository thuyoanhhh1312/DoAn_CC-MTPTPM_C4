import React, { useState, useEffect } from "react";
import { Dialog, IconButton, Box, Slide } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import QuickSearchInput from "./QuickSearchInput";
import QuickSearchResults from "./QuickSearchResults";
import productApi from "../api/productApi";
import { useNavigate } from "react-router-dom";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const QuickSearchPopup = ({ open, onClose }) => {
  const [searchText, setSearchText] = useState("");
  const [quickResults, setQuickResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [noResult, setNoResult] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setSearchText("");
      setQuickResults([]);
      setNoResult(false);
      return;
    }
    if (searchText.trim() === "") {
      setQuickResults([]);
      setNoResult(false);
      return;
    }
    setSearching(true);
    const delayDebounce = setTimeout(async () => {
      const products = await productApi.quickSearchProducts(searchText, 8);
      setQuickResults(products);
      setSearching(false);
      setNoResult(products.length === 0);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchText, open]);

  const handleInputChange = (e) => setSearchText(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    e.preventDefault();
    const keyword = searchText.trim();
    if (!keyword) return;

    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    onClose();
  };

  const handleSelectKeyword = (keyword) => {
    setSearchText(keyword);
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 0,
          bgcolor: "transparent",
          boxShadow: "none",
        },
      }}
      sx={{ zIndex: 1500 }}
    >
      <Box
        sx={{
          position: "relative",
          minHeight: "400px",
          bgcolor: "transparent",
        }}
      >
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 20,
            top: 16,
            color: "#C48C46",
            zIndex: 100,
            background: "#fff",
            boxShadow: "0 2px 8px #eee",
          }}
        >
          <CloseIcon fontSize="medium" />
        </IconButton>
        <QuickSearchInput
          value={searchText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <QuickSearchResults
          searchText={searchText}
          hotProducts={quickResults}
          noResult={noResult}
          searching={searching}
          onSelectKeyword={handleSelectKeyword}
          onClose={onClose}
        />
      </Box>
    </Dialog>
  );
};

export default QuickSearchPopup;
