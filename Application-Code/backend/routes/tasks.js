const Task = require("../models/task");
const express = require("express");
const client = require("prom-client");

const router = express.Router();

/**
 * 🔹 Prometheus setup
 */
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// Custom metrics
const httpRequestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status"],
});

const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status"],
});

/**
 * 🔹 Middleware to track metrics
 */
router.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = (Date.now() - start) / 1000;

        httpRequestCounter.inc({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status: res.statusCode,
        });

        httpRequestDuration.observe(
            {
                method: req.method,
                route: req.route ? req.route.path : req.path,
                status: res.statusCode,
            },
            duration
        );
    });

    next();
});

/**
 * 🔹 Routes
 */
router.post("/", async (req, res) => {
    try {
        const task = await new Task(req.body).save();
        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get("/", async (req, res) => {
    try {
        const tasks = await Task.find();
        res.send(tasks);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.put("/:id", async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id },
            req.body
        );
        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * 🔹 Metrics endpoint (VERY IMPORTANT)
 */
router.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});

module.exports = router;

// const Task = require("../models/task");
// const express = require("express");
// const router = express.Router();

// router.post("/", async (req, res) => {
//     try {
//         const task = await new Task(req.body).save();
//         res.send(task);
//     } catch (error) {
//         res.send(error);
//     }
// });

// router.get("/", async (req, res) => {
//     try {
//         const tasks = await Task.find();
//         res.send(tasks);
//     } catch (error) {
//         res.send(error);
//     }
// });

// router.put("/:id", async (req, res) => {
//     try {
//         const task = await Task.findOneAndUpdate(
//             { _id: req.params.id },
//             req.body
//         );
//         res.send(task);
//     } catch (error) {
//         res.send(error);
//     }
// });

// router.delete("/:id", async (req, res) => {
//     try {
//         const task = await Task.findByIdAndDelete(req.params.id);
//         res.send(task);
//     } catch (error) {
//         res.send(error);
//     }
// });

// module.exports = router;
