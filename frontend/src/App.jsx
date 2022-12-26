import { useEffect, useState } from "react";
import TemplateBanana from "./TemplateBanana";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// Questions are from https://conversationstartersworld.com/funny-questions-to-ask/
const templateQuestions = [
    "Is cereal soup? Why or why not?",
    "What is the sexiest and least sexy name?",
    "What secret conspiracy would you like to start?",
    "What’s invisible but you wish people could see?",
    "What’s the weirdest smell you have ever smelled?",
    "Is a hotdog a sandwich? Why or why not?",
    "What’s the best Wi-Fi name you’ve seen?",
    "What’s the most ridiculous fact you know?",
    "What is something that everyone looks stupid doing?",
    "What is the funniest joke you know by heart?",
    "In 40 years, what will people be nostalgic for?",
    "What are the unwritten rules of where you work?",
    "How do you feel about putting pineapple on pizza?",
    "What part of a kid’s movie completely scarred you?",
    "What kind of secret society would you like to start?",
    "If animals could talk, which would be the rudest?",
    "Toilet paper, over or under?",
    "What’s the best type of cheese?",
    "What’s the best inside joke you’ve been a part of?",
    "In one sentence, how would you sum up the internet?",
    "How many chickens would it take to kill an elephant?",
    "What is the most embarrassing thing you have ever worn?",
    "What’s the most imaginative insult you can come up with?",
    "Which body part do you wish you could detach and why?",
    "What used to be considered trashy but now is very classy?",
    "What’s the weirdest thing a guest has done at your house?",
    "What mythical creature would improve the world most if it existed?",
    "What inanimate object do you wish you could eliminate from existence?",
    "What is the weirdest thing you have seen in someone else’s home?",
    "What would be the absolute worst name you could give your child?",
    "What would be the worst thing for the government to make illegal?",
    "What are some of the nicknames you have for customers or coworkers?",
    "If peanut butter wasn’t called peanut butter, what would it be called?",
    "What movie would be greatly improved if it was made into a musical?",
    "What is the funniest corporate / business screw up you have heard of?",
    "What would be the worst “buy one get one free” sale of all time?",
    "If life were a video game, what would some of the cheat codes be?",
    "What is the funniest name you have actually heard used in the real world?",
    "What sport would be the funniest to add a mandatory amount of alcohol to?",
    "What would be the coolest animal to scale up to the size of a horse?",
    "What two totally normal things become really weird if you do them back to back?",
    "What set of items could you buy that would make the cashier the most uncomfortable?",
    "What would be the creepiest thing you could say while passing a stranger on the street?",
    "What is something that you just recently realized that you are embarrassed you didn’t realize earlier?",
    "What are some fun and interesting alternatives to war that countries could settle their differences with?",
    "What would be the best-worst name for different types of businesses? (dry cleaners, amusement parks, etc.)",
    "Who do you know that really reminds you of a character in a TV show or movie?",
    "What would the world be like if it was filled with male and female copies of you?",
    "What are some things that are okay to occasionally do but definitely not okay to do every day?",
    "If you were arrested with no explanation, what would your friends and family assume you had done?",
    "You’re a mad scientist, what scientific experiment would you run if money and ethics weren’t an issue?",
    "What are some fun ways to answer everyday questions like “how’s it going” or “what do you do”?",
    "If someone asked to be your apprentice and learn all that you know, what would you teach them?",
    "If your five-year-old self suddenly found themselves inhabiting your current body, what would your five-year-old self do first?",
    "First think of a product. Now, what would be the absolute worst brand name for one of those products?",
    "What movie completely changes its plot when you change one letter in its title? What’s the new movie about?",
    "If the all the States in the USA were represented by food, what food would each state be represented by?",
    "What would some fairy tales be like if they took place in the present and included modern technology and culture?",
    "What is something that is really popular now, but in 5 years everyone will look back on and be embarrassed by?",
    "Where was the most in appropriate / most embarrassing place you’ve farted?",
];

function App() {
    const [request, setRequest] = useState(templateQuestions[Math.floor(Math.random()*templateQuestions.length)]);
    const [charCounter, setCharCounter] = useState(request.length);
    const [requestCounter, setRequestCounter] = useState(0);
    const [totalRequests, setTotalRequests] = useState(0);
    const [pendingRequests, setPendingRequests] = useState(0);
    const [answer, setAnswer] = useState("-");

    const [errorInput, setErrorInput] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        updateMetadata();
        // const interval = setInterval(updateMetadata, 5000);
        const interval = setInterval(updateMetadata, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setCharCounter(request.length);
        setErrorInput(request.length <= 0 || request.length > 128);
    }, [request]);

    function updateMetadata() {
        // fetch("http://10.0.0.150:12345/api/metadata")
        fetch("http://127.0.0.1:80/api/metadata")
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

        // fetch("http://10.0.0.150:12345/api/askquestion", {
        fetch("http://127.0.0.1:80/api/askquestion", {
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
        <TemplateBanana
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Grid container spacing={5} columns={4} sx={{ width: "100%", padding: "0 30px 0 30px" }}>
                <Grid
                    xs
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        textAlign: "right",
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
                    <Typography variant="body1">requests are currently beeing processed.</Typography>
                </Grid>
                <Grid
                    xs={2}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        maxWidth: "600px",
                    }}
                >
                    <Typography variant="h1">Rude Mr. Robot 🤖</Typography>
                    <Typography variant="body1">
                        Rude Mr. Robot is a website that <b>answers your questions</b> in a <b>rude</b> way.
                        <br />
                    </Typography>
                    <TextField
                        sx={{ width: "100%", marginTop: "40px" }}
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
                            }}
                        >
                            Answer from Mr. Robot
                        </Typography>
                        {answer}
                    </Typography>
                </Grid>
                <Grid
                    xs
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
