"use strict";

var moment = require("moment");
const _ = require("underscore");
const log = require("../../util/log");
const { jasper } = require("../../server");
const { API } = require("../../util/constant");

const sample_report = {
    method: "GET",
    path: API.CONTEXT + API.SAMPLE_REPORT,
    options: {
        auth: false,
        description: "sample report",
        plugins: { hapiAuthorization: false },
    },
    handler: async (request, h) => {
        return await handle_request(request, h);
    },
};

const handle_request = async (request, h) => {
    let response = { status: false };
    const file_name = "sample_" + moment().format("YYYY-MM-DD__HHmmss") + ".pdf";
    try {
        let report = {
            report: "sample_report",
            data: {
                welcome: "Welcome"
            },            
            dataset: [{id: "01", name: "Asif Taj"}, {id: "02", name: "Mainur Rahman Rasel"}]
        };

        let file = jasper.pdf(report);
        log.info(`Download report - [${file_name}]`);
        return h
            .response(file)
            .header("Content-Length", file.length)
            .header("Content-Type", "application/pdf")
            .header("Content-disposition", "attachment; filename=" + file_name);
    } catch (e) {
        log.error(`An exception occurred while sending sms : ${e?.message}`);
        return h.response(_.extend(response, { code: 202, message: "Contact system administrator!!!" }));
    }
};

module.exports = sample_report;
