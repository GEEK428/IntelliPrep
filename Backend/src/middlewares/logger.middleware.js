function requestLogger(req, res, next) {
    const start = Date.now();
    const { method, url, ip } = req;

    res.on("finish", () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        console.log(`[${new Date().toISOString()}] ${method} ${url} ${status} - ${duration}ms - IP: ${ip}`);
    });

    next();
}

module.exports = requestLogger;
