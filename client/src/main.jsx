import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/reset.css";
import "primereact/resources/themes/lara-light-amber/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import ThemeProviderWrapper from "./components/ThemeProviderWrapper";
import { AppWrapper } from "./components/admin/common/PageMeta";
import { createStore } from "redux";
import { Provider } from "react-redux";
import rootReducer from "./reducers";

const store = createStore(rootReducer);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <ThemeProvider>
      <ThemeProviderWrapper>
        <AppWrapper>
          <App />
        </AppWrapper>
      </ThemeProviderWrapper>
    </ThemeProvider>
  </Provider>,
);
