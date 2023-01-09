import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TemplateBanana from "../components/TemplateBanana";

function App({ templateQuestions = [] }) {
    const [request, setRequest] = useState(templateQuestions[Math.floor(Math.random() * templateQuestions.length)]);
    const [charCounter, setCharCounter] = useState(request.length);
    const [requestCounter, setRequestCounter] = useState(0);
    const [totalRequests, setTotalRequests] = useState(0);
    const [pendingRequests, setPendingRequests] = useState(0);
    const [answer, setAnswer] = useState("-");

    const [errorInput, setErrorInput] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        updateMetadata();
        const interval = setInterval(updateMetadata, 2500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setCharCounter(request.length);
        setErrorInput(request.length <= 0 || request.length > 128);
    }, [request]);

    function updateMetadata() {
        fetch(`${import.meta.env.BASE_URL.replace(/\/+$/, "")}/api/metadata`)
            .then((data) => data.json())
            .then((data) => {
                setTotalRequests(data.totalrequests);
                setPendingRequests(data.pendingrequests);
            })
            .catch((error) => {
                console.error("Something went wrong");
                console.error(error);
            });
    }

    const handleRequest = (event) => {
        setLoading(true);
        setRequestCounter((requestCounter) => requestCounter + 1);

        fetch(`${import.meta.env.BASE_URL.replace(/\/+$/, "")}/api/askquestion`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                question: request,
            }),
        })
            .then((data) => data.json())
            .then((data) => {
                setAnswer(data.answer);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Something went wrong");
                console.error(error);
                setLoading(false);
            });
    };

    return (
        <TemplateBanana>
            <Grid
                container
                spacing={5}
                columns={4}
                sx={{ width: "100%", height: "100%", padding: { md: "20px 70px", xs: "10px" }, margin: 0 }}
            >
                <Grid
                    lg={1}
                    md={1}
                    xs={4}
                    order={{ lg: 1, md: 1, xs: 3 }}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: {
                            md: "flex-end",
                            xs: "center",
                        },
                        justifyContent: "center",
                        textAlign: {
                            md: "right",
                            xs: "center",
                        },
                    }}
                >
                    <Typography variant="h4">Request counter</Typography>
                    <Typography variant="h1">{totalRequests}</Typography>
                    <Typography variant="body1">
                        requests have been
                        <br />
                        submitted by all users.
                    </Typography>

                    <Typography variant="h4" sx={{ mt: "40px" }}>
                        Your request counter
                    </Typography>
                    <Typography variant="h1">{requestCounter}</Typography>
                    <Typography variant="body1">
                        requests have been
                        <br />
                        submitted by you.
                    </Typography>

                    <Typography variant="h4" sx={{ mt: "40px" }}>
                        Pending requests
                    </Typography>
                    <Typography variant="h1">{pendingRequests}</Typography>
                    <Typography variant="body1">
                        requests are currently <br /> beeing processed.
                        <br />
                        The estimated waiting time <br /> is about{" "}
                        <Typography variant="h3" sx={{ display: "inline-block" }}>
                            {pendingRequests * 5} seconds
                        </Typography>
                    </Typography>
                </Grid>

                <Grid
                    lg={2}
                    md={3}
                    xs={4}
                    order={{ lg: 2, md: 2, xs: 1 }}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography variant="h1" align="center">
                        Rude Mr. Robot 🤖
                    </Typography>
                    <Typography variant="body1" align="center">
                        Rude Mr. Robot is a website that <b>answers your questions</b> in a <b>rude</b> way.
                    </Typography>
                    <TextField
                        sx={{ width: "100%", marginTop: "40px", maxWidth: "600px" }}
                        label={"Your Question (" + charCounter + "/128)"}
                        multiline
                        minRows={6}
                        maxRows={6}
                        value={request}
                        placeholder="How can i grow an Ananas?"
                        focused
                        error={errorInput}
                        onChange={(event) => setRequest(event.target.value)}
                    ></TextField>
                    <Button
                        variant="contained"
                        disabled={errorInput || loading}
                        onClick={handleRequest}
                        sx={{ marginTop: "20px" }}
                    >
                        Submit your Question
                    </Button>
                    <Typography
                        sx={{
                            position: "relative",
                            width: "100%",
                            marginTop: "20px",
                            maxWidth: "600px",
                            minHeight: "150px",
                            background: "#e0e0e0",
                            fontFamily: "monospace",
                            padding: "20px",
                            borderRadius: "5px",
                        }}
                        variant="body1"
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                position: "absolute",
                                top: -12,
                                left: 10,
                                background: "#e0e0e0",
                                padding: "2px 5px 2px 5px",
                                borderRadius: "5px",
                                maxWidth: "600px",
                            }}
                        >
                            Answer from Mr. Robot
                        </Typography>
                        {answer}
                    </Typography>
                    <Typography variant="body2">
                        <Link to="/requests" underline="hover">
                            All requests (also from other useres)
                        </Link>
                    </Typography>
                </Grid>

                <Grid
                    lg={1}
                    md={4}
                    xs={4}
                    order={{ lg: 3, md: 3, xs: 2 }}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}
                >
                    <Paper elevation={3} sx={{ p: "10px" }}>
                        <Typography variant="h4" sx={{ display: "flex", alignItems: "center" }}>
                            <ErrorOutlineRoundedIcon color="error" sx={{ mr: "5px" }} />
                            Disclaimer
                        </Typography>
                        <Typography variant="body2">
                            This website is intended for usage by people who have <b>humor</b>. The ouput of this website might
                            produce <b>insensitive</b>, <b>insulting</b> and <b>offensive</b> content. People who are{" "}
                            <b>easly offended</b>, should <b>refrain from using</b> this website. <br />
                            Please also <b>be mindful</b> what you ask. The output of this website is based on the input you
                            provide. <br />
                            Also please be aware that the input your provide is <b>stored</b> and <b>processed</b> by the website.{" "}
                            <br /> If you don't consent to this, don't use this website!
                        </Typography>
                    </Paper>
                    <Paper elevation={3} sx={{ mt: "20px", p: "10px" }}>
                        <Typography variant="h4" sx={{ display: "flex", alignItems: "center" }}>
                            <InfoOutlinedIcon color="info" sx={{ mr: "5px" }} />
                            Note
                        </Typography>
                        <Typography variant="body2">
                            The API by <a href="https://openai.com/">OpenAI</a> is ratelimited. Therefore please don't spam the
                            API!!! Also please be patient, Mr. Robot might take a while to answer your question, if more users are
                            using it at the same time.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </TemplateBanana>
    );
}

export default App;
