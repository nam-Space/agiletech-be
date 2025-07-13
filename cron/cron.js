const cron = require('cron');
const https = require('https');
require('dotenv').config()

const URL = process.env.BACKEND_URL;

const job = new cron.CronJob("*/14 * * * *", function () {
    https
        .get(URL, (res) => {
            if (res.statusCode === 200) {
                console.log("GET request sent successfully");
            } else {
                console.log("GET request failed", res.statusCode);
            }
        })
        .on("error", (e) => {
            console.error("Error while sending request", e);
        });
});

module.exports = job;