import { createTheme, ThemeProvider } from "@mui/material/styles";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import Requests from "./Pages/Requests";

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

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <BrowserRouter basename="/ruderobot/">
                <Routes>
                    <Route path="/" element={<App templateQuestions={templateQuestions} />} />
                    <Route
                        path="/requests"
                        element={<Requests templateQuestions={templateQuestions} />}
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>

            {/* <RouterProvider router={router} /> */}
        </ThemeProvider>
    </React.StrictMode>
);
