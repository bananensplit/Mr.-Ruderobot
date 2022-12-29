import EmojiObjectsRoundedIcon from "@mui/icons-material/EmojiObjectsRounded";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import { useEffect, useState } from "react";
import Request from "../components/Request";
import TemplateBanana from "../components/TemplateBanana";

function Requests({ templateQuestions }) {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL.replace(/\/+$/, "")}api/allquestions`)
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
            <Grid container columns={12} spacing={2} sx={{ m: "30px" }}>
                <Grid
                    item
                    lgOffset={3}
                    lg={6}
                    xsOffset={0}
                    xs={12}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
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
                            <Request request={request} templateQuestion={templateQuestions.includes(request.question)} />
                        ))}
                    </Box>
                </Grid>

                <Grid
                    item
                    lg={2}
                    sx={{
                        position: "sticky",
                        top: "10px",
                        height: "max-content",
                        display: { lg: "flex", xs: "none" },
                        flexDirection: "column",
                        gap: "10px",
                    }}
                >
                    <Box sx={{ mt: "30px" }}>
                        <Typography variant="h3">{requests.length || "-"}</Typography>
                        <Typography variant="body2">total questions</Typography>
                    </Box>

                    <Box>
                        <Typography variant="h3">
                            {requests.map((request) => request.prompt_tokens).reduce((a, b) => a + b, 0) || "-"}
                        </Typography>
                        <Typography variant="body2">tokens used in questions</Typography>
                    </Box>

                    <Box>
                        <Typography variant="h3">
                            {requests.map((request) => request.completion_tokens).reduce((a, b) => a + b, 0) || "-"}
                        </Typography>
                        <Typography variant="body2">tokens used in answers</Typography>
                    </Box>

                    <Box>
                        <Typography variant="h3">
                            {requests.map((request) => request.total_tokens).reduce((a, b) => a + b, 0) || "-"}
                        </Typography>
                        <Typography variant="body2">total tokens used</Typography>
                    </Box>

                    <Box>
                        <Typography variant="h3">
                            {(requests.map((request) => request.total_tokens).reduce((a, b) => a + b, 0) * 0.0000204918).toFixed(
                                2
                            ) || "-"}{" "}
                            $
                        </Typography>
                        <Typography variant="body2">total tokens in $</Typography>
                    </Box>

                    <Box>
                        <Typography variant="body2">Indicators</Typography>
                        <Typography variant="h3" sx={{ display: "flex" }}>
                            <Tooltip
                                sx={{ fontSize: (theme) => theme.typography.h3.fontSize }}
                                title="Indicates that this question was in the sample set provided by the developer."
                                arrow
                            >
                                <EmojiObjectsRoundedIcon
                                    sx={{
                                        color: (theme) => theme.palette.primary.light,
                                        fontSize: (theme) => theme.typography.h3.fontSize,
                                    }}
                                />
                            </Tooltip>
                            {requests.filter((request) => templateQuestions.includes(request?.question)).length}
                            /
                            <EmojiObjectsRoundedIcon
                                sx={{
                                    color: (theme) => theme.palette.grey[300],
                                    fontSize: (theme) => theme.typography.h3.fontSize,
                                }}
                            />
                            {requests.filter((request) => !templateQuestions.includes(request?.question)).length}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </TemplateBanana>
    );
}

export default Requests;
