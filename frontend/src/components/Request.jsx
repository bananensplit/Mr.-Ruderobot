import EmojiObjectsRoundedIcon from "@mui/icons-material/EmojiObjectsRounded";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import moment from "moment";

function Request({ request, templateQuestion = false }) {
    return (
        <Paper elevation={6} sx={{ width: "100%", maxWidth: "700px", padding: "20px" }}>
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

            <Box sx={{ mt: "10px", display: "flex", flexWrap: "wrap", columnGap: "30px", rowGap: "20px" }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "min-content max-content",
                        gridColumnGap: "10px",
                        minWidth: "180px",
                    }}
                >
                    <Typography variant="body1">{request?.prompt_tokens || "-"}</Typography>
                    <Typography variant="subtitle2">Tokens used for Prompt</Typography>
                    <Typography variant="body1">{request?.completion_tokens || "-"}</Typography>
                    <Typography variant="subtitle2">Tokens used for Answer</Typography>
                    <Typography variant="body1">{request?.total_tokens || "-"}</Typography>
                    <Typography variant="subtitle2">Total tokens used</Typography>
                </Box>

                <Box sx={{ minWidth: "150px" }}>
                    <Typography variant="subtitle2">Asked on</Typography>
                    <Typography variant="body1">
                        {(request?.time && moment(request.time).format("DD.MM.YYYY, HH:mm:ss")) || "-"}
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="subtitle2">Indicators</Typography>
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            columnGap: "5px",
                            rowGap: "7px",
                        }}
                    ></Box>
                    <Tooltip
                        disableHoverListener={!templateQuestion}
                        disableTouchListener={!templateQuestion}
                        title="Indicates that this question was in the sample set provided by the developer."
                        arrow
                    >
                        <EmojiObjectsRoundedIcon
                            sx={{
                                color: (theme) => (templateQuestion ? theme.palette.primary.light : theme.palette.grey[300]),
                            }}
                        />
                    </Tooltip>
                </Box>
            </Box>
        </Paper>
    );
}

export default Request;
