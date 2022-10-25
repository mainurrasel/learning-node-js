"use strict";

var moment = require("moment");
const _ = require("underscore");
const log = require("../../util/log");
const { jasper } = require("../../server");
const { API } = require("../../util/constant");

const sample_report_data_binding = {
    method: "GET",
    path: API.CONTEXT + API.SAMPLE_REPORT_WITH_PARAM + "/{oid}",
    options: {
        auth: false,
        description: "Data Binding with params",
        plugins: { hapiAuthorization: false },
        cors: {
            exposedHeaders: ['filename'],
        }
    },
    handler: async (request, h) => {
        log.debug(`Request received - ${JSON.stringify(request.params.oid)}`);
        return await handle_request(request, h);
    },
};

const handle_request = async (request, h) => {
    let response = { status: false };
    const file_name = "sample_" + moment().format("YYYY-MM-DD__HHmmss") + ".pdf";
    let data = await get_data(request);
    if (data.length != 1) {
        return h.response(_.extend(response, { code: 201, message: "No data found" }));
    }

    let file = get_pdf_report(data[0]);
    if (file == null) {
        return h.response(_.extend(response, { code: 202, message: "Unable to generate file" }));
    }
    log.info(` [${request.auth.credentials.userid}] - [File Downloaded] - [${file_name}]`);
    return h
        .response(file)
        .header("Content-Type", "application/pdf")
        .header("Content-Length", file.length)
        .header("filename", file_name)
};

const get_pdf_report = (row) => {
    const data = _.clone(row);
    let file = null;
    let report = {
        report: "report",
        data: data,
        dataset: [{ name: "sample_report_data_binding" }],
    };
    try {
        file = jasper.pdf(report);
    } catch (e) {
        log.error(`An exception occurred while generating file : ${e?.message}`);
    }
    return file;
};

const get_data = async (request) => {
    let data = [];
    let sql = {
        text: `select nameen as nameEn
        from tableName t
        where 1 = 1 and t.oid = $1`,
        values: [request.params.oid],
    };
    try {
        data = await Dao.get_data(request.pg, sql);
    } catch (e) {
        log.error(`An exception occurred while getting data : ${e?.message}`);
    }
    return data;
};

module.exports = sample_report_data_binding;
