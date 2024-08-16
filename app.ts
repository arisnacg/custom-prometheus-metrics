import express from "express";
import Prometheus from "prom-client";

const app = express();

// Prometheus metrics
const register = new Prometheus.Registry();
const requestCounter = new Prometheus.Counter({
	name: "requests_total",
	help: "Total number of requests",
	labelNames: ["publisherId", "status"],
	registers: [register],
});
const responseTimeHistogram = new Prometheus.Histogram({
	name: "requests_response_time",
	help: "Response time of requests",
	labelNames: ["publisherId", "status"],
	buckets: [
		0.1, 0.3, 0.5, 0.7, 1, 1.3, 1.5, 1.7, 2, 2.5, 3, 3.5, 5, 7, 10, 15, 20,
	],
	registers: [register],
});

const customMetricsValue = async () => {
	const arrPublisherId = ["123", "456", "789"];
	const arrStatus = ["200", "400", "500"];
	for (let i = 0; i < 100000000000; i++) {
		const publisherId =
			arrPublisherId[Math.floor(Math.random() * arrPublisherId.length)];
		// const status = arrStatus[Math.floor(Math.random() * arrStatus.length)];
		const status = "200";

		// Random response time
		let responseTime: number;
		if (publisherId === "123") {
			// range 0.1 - 1
			responseTime = Math.random() * (1 - 0.1) + 0.1;
		} else if (publisherId === "456") {
			// range 2 - 4
			responseTime = Math.random() * (5 - 1) + 1;
		} else {
			// range 5 - 10
			responseTime = Math.random() * (10 - 5) + 5;
		}

		// Set custom metrics value
		requestCounter.inc({ publisherId, status });
		responseTimeHistogram.observe({ publisherId, status }, responseTime);

		console.log(
			`publisherId: ${publisherId} | status: ${status} | responseTime: ${responseTime}`,
		);

		await sleep(500);
	}
};

const sleep = (ms: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};

customMetricsValue();

// Express
app.get("/metrics", async (req, res) => {
	res.setHeader("Content-Type", register.contentType);
	const metrics = await register.metrics();
	res.send(metrics);
});

app.listen(8080, () => {
	console.log("Server is running on port 8080");
});
