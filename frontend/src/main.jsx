import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
    typography: {
        fontFamily: ["Poppins", "Helvetica", "Arial", "sans-serif"].join(","),
        fontSize: 12,
        h1: {
            fontSize: "2em",
            fontWeight: 700,
        },
        h2: {
            fontSize: "1.5em",
            fontWeight: 700,
        },
        h3: {
            fontSize: "1.17em",
            fontWeight: 700,
        },
        h4: {
            fontSize: "1em",
            fontWeight: 700,
        },
        h5: {
            fontSize: "0.83em",
            fontWeight: 700,
        },
        h6: {
            fontSize: "0.67em",
            fontWeight: 700,
        },
    },
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    </React.StrictMode>
);
