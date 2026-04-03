import React from "react";
import { Box, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const QuickSearchInput = ({
  value,
  onChange,
  onKeyDown,
  autoFocus = true,
  placeholder = "Bạn muốn tìm gì?",
}) => {
  return (
    <Box
      sx={{
        p: 0,
        mx: 4,
        mt: 3,
        zIndex: 10,
        position: "relative",
      }}
    >
      <TextField
        autoFocus={autoFocus}
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        InputProps={{
          style: {
            borderRadius: 16,
            backgroundColor: "#fff",
            fontSize: 16,
            padding: "4px 12px",
            fontFamily: "'Inter', sans-serif",
          },
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#c48c46", fontSize: 22 }} />
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            fontSize: 16,
            boxShadow: "0 2px 16px 0 rgba(0,0,0,0.06)",
            "& fieldset": {
              borderColor: "#e8e4de",
              borderWidth: 1.5,
            },
            "&:hover fieldset": {
              borderColor: "#c48c46",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#c48c46",
              borderWidth: 2,
              boxShadow: "0 0 0 3px rgba(196, 140, 70, 0.1)",
            },
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#9ca3af",
            opacity: 1,
            fontStyle: "normal",
          },
        }}
      />
    </Box>
  );
};

export default QuickSearchInput;
