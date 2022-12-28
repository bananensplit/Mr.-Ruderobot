import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import { useEffect, useState } from "react";
import TemplateBanana from "../TemplateBanana";

function Requests({ children, templateQuestions }) {
    const [requests, setRequests] = useState([]);
    useEffect(() => {
        // fetch("api/allquestions")
        fetch("http://127.0.0.1:80/api/allquestions")
            .then((response) => response.json())
            .then((data) => {
                setRequests(data?.questions || requests);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    return (
        <TemplateBanana>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    margin: "30px",
                }}
            >
                <Typography variant="h1" align="center">
                    Rude Mr. Robot 🤖
                </Typography>
                <Typography variant="h3" align="center">
                    <Typography variant="body1" display="inline-block">
                        rude
                    </Typography>{" "}
                    Requests{" "}
                    <Typography variant="body1" display="inline-block">
                        and
                    </Typography>{" "}
                    Answers
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", mt: "30px" }}>
                    {requests.map((request) => (
                        <Paper elevation={4} sx={{ width: "100%", maxWidth: "700px", padding: "20px" }}>
                            <Grid container columns={2} columnSpacing={2}>
                                <Grid item xs>
                                    <Typography variant="h5">Question</Typography>
                                    <Typography variant="body1">{request?.question || "-"}</Typography>
                                </Grid>
                                <Divider orientation="vertical" flexItem />
                                <Grid item xs>
                                    <Typography variant="h5">Answer</Typography>
                                    <Typography variant="body1">{request?.answer || "-"}</Typography>
                                </Grid>
                            </Grid>
                            <Divider sx={{ mt: "10px" }} />
                            <Grid
                                container
                                columns={6}
                                rowSpacing={0}
                                columnSpacing={3}
                                sx={{ width: "100%", maxWidth: "250px", mt: "10px" }}
                            >
                                <Grid item xs={1}>
                                    <Typography variant="body1">{request?.prompt_tokens || "-"}</Typography>
                                </Grid>
                                <Grid item xs={5}>
                                    <Typography variant="subtitle2">Tokens used for Prompt</Typography>
                                </Grid>
                                <Grid item xs={1}>
                                    <Typography variant="body1">{request?.completion_tokens || "-"}</Typography>
                                </Grid>
                                <Grid item xs={5}>
                                    <Typography variant="subtitle2">Tokens used for Answer</Typography>
                                </Grid>
                                <Grid item xs={1}>
                                    <Typography variant="body1">{request?.total_tokens || "-"}</Typography>
                                </Grid>
                                <Grid item xs={5}>
                                    <Typography variant="subtitle2">Total tokens used</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </Box>
            </Box>
            {children}
        </TemplateBanana>
    );
}

export default Requests;
