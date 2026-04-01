import React from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { useTheme as useCustomTheme } from "../context/ThemeContext";
import { getMuiTheme } from "../theme/muiTheme";

const ThemeProviderWrapper = ({ children }) => {
  const { theme } = useCustomTheme(); // "light" hoặc "dark"
  const muiTheme = React.useMemo(() => getMuiTheme(theme), [theme]);

  return <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>;
};

export default ThemeProviderWrapper;
