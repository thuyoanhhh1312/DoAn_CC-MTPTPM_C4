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
            borderRadius: 14,
            backgroundColor: "#fff",
            fontSize: 18,
            padding: "2px 8px",
          },
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#C48C46" }} />
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            fontSize: 18,
            "& fieldset": {
              borderColor: "#c4c4c4",
            },
            "&:hover fieldset": {
              borderColor: "#c4c4c4",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#c4c4c4",
              borderWidth: 1.5,
            },
          },
        }}
      />
    </Box>
  );
};

export default QuickSearchInput;
