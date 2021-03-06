'use strict';

const express = require('express');
const controllerFactory = require('../controllers/controllerFactory');
const app = express();

module.exports = function createServer (config, logger, CpuTask, AsyncTasksQueue, SerializationTask) {
    const { routes, port, cpuData } = config;

    const controller = controllerFactory(logger, CpuTask, AsyncTasksQueue, SerializationTask);

    routes.forEach(route => {
        app.get(`/${route}`, controller.home);
    });

    app.get('/cpu', function (req, res) {
        req.data = { sum: cpuData.micro.sum, set: cpuData.micro.set };
        return controller.cpu(req, res);
    });

    app.get('/cpu/macro', function (req, res) {
        req.data = { sum: cpuData.macro.sum, set: cpuData.macro.set };
        return controller.cpu(req, res);
    });

    app.get('/async', function (req, res) {
        req.data = { set: cpuData.macro.set };

        return controller.libuv(req, res);
    });

    app.get('/log', function (req, res) {
        req.metaData = { method: req.method, url: req.url, headers: req.headers };
        controller.log(req, res);
    });

    app.get('/biglog', function (req, res) {
        controller.bigLog(req, res);
    });

    app.get('/holy', function (req, res) {
        req.metaData = { method: req.method, url: req.url, headers: req.headers };
        req.data = cpuData;
        return controller.holy(req, res);
    });

    app.get('/serialize', function (req, res) {
        return controller.serialize(req, res);
    });

    app.get('/deserialize', function (req, res) {
        return controller.deserialize(req, res);
    });

    app.get('/demo', function (req, res) {
        req.metaData = { method: req.method, url: req.url, headers: req.headers };
        req.data = cpuData;
        return controller.demo(req, res);
    });

    app.listen(port, function () {
        // Used stderr since stdout piped to external logger app
        process.stderr.write(`Express server pid:${process.pid} listening on port ${port}!\n`);
    });

    return app;
};
