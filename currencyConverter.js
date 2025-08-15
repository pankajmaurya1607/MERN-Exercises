// Problem : August 14 2025

// Build a currency converter using the ExchangeRate API


const express = require("express")
const axios = require("axios")

const app = express();
const PORT = 3000

const API_KEY = "6ab469d51d2cd5803e7c1671"
// GET /convert?from=USD&to=INR&amount=10
app.get("/convert", async(req, res) => {
    const {from, to, amount} = req.query;

    // Validate query params
    if(!from || !to || !amount || isNaN(amount)) {
        return res.status(400).json({error: "Please provide from, to and amount query parameters"})
    } 
    try {
        // Fetch exchange rates for 'from' currency
        const response = await axios.get(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${from.toUpperCase()}`);

        // Extract the rate for the target currency
        const rate = response.data.conversion_rates[to.toUpperCase()];
        
        if(!rate) {
            return res.status(400).json({error: `Invalid target currency: ${to}`});
        }

        // convert amount
        const convertedAmount = (parseFloat(amount) * rate).toFixed(2);

        res.json({
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            amount: parseFloat(amount),
            rate,
            convertedAmount
        });
    }
    catch(error) {
        res.status(500).json({error: "Error fetching exchange rate"})
    }
});

app.listen(PORT, () => {
    console.log(`Currency Converter API running at http://localhost:${PORT}`);
});


