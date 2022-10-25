"use strict";

require("winston-daily-rotate-file");
const path = require("path");
const winston = require("winston");
const Mail = require('winston-mail-lite');
const PROJECT_ROOT = path.join(__dirname, "..");

const console_log = new winston.transports.Console({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        winston.format.simple(),
        winston.format.printf((info) => {
            return `${info.timestamp} ${info.level.toUpperCase()} - ${info.message} `;
        }),
        winston.format.colorize({ all: true })
    ),
});

const info_file_log = new winston.transports.DailyRotateFile({
    filename: `log/info/archived/sample-report/prod/sample-report__%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        winston.format.simple(),
        winston.format.printf((info) => {
            return `${info.timestamp} ${info.level.toUpperCase()} - ${info.message} `;
        }),
        // winston.format.colorize({ all: true })
    ),
});

const debug_file_log = new winston.transports.DailyRotateFile({
    filename: `log/debug/archived/sample-report/prod/sample-report__%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    level: "debug",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        winston.format.simple(),
        winston.format.printf((info) => {
            return `${info.timestamp} ${info.level.toUpperCase()} - ${info.message} `;
        }),
        winston.format.colorize({ all: true })
    ),
});

let log;

if (process.env.NODE_ENV == 'prod' || process.env.NODE_ENV == 'dev') {
    const send_smtp_mail = new Mail(
        {
            level: 'error',
            messageOptions: {
                to: [],
                from: '',
                subject: `[][][${process.env.NODE_ENV.toUpperCase()}] ERROR`,
                text: `{{ message }}`
            },
            transportOptions: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: '',
                    pass: ''
                },
                // ssl: false,
                tls: true,
                starttls: true
            }
        }
    );

    log = new winston.createLogger({
        level: "debug",
        transports: [console_log, info_file_log, debug_file_log, send_smtp_mail],
    });
} else {
    log = new winston.createLogger({
        level: "debug",
        transports: [console_log, info_file_log, debug_file_log],
    });
}

log.stream = {
    write: function (message) {
        log.info(message);
    },
};

module.exports.debug = module.exports.log = function () {
    log.debug.apply(log, formatLogArguments(arguments));
};

module.exports.info = function () {
    log.info.apply(log, formatLogArguments(arguments));
};

module.exports.warn = function () {
    log.warn.apply(log, formatLogArguments(arguments));
};

module.exports.error = function () {
    log.error.apply(log, formatLogArguments(arguments));
};

module.exports.stream = log.stream;

function formatLogArguments(args) {
    args = Array.prototype.slice.call(args);

    var stackInfo = getStackInfo(1);

    if (stackInfo) {
        var calleeStr = stackInfo.relativePath + ":" + stackInfo.line;
        if (typeof args[0] === "string") {
            args[0] = calleeStr + " - " + args[0];
        } else {
            args.unshift(calleeStr);
        }
    }
    return args;
}

function getStackInfo(stackIndex) {
    // get call stack, and analyze it
    // get all file, method, and line numbers
    var stacklist = new Error().stack.split("\n").slice(3);

    // stack trace format:
    // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
    // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
    var stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
    var stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

    var s = stacklist[stackIndex] || stacklist[0];
    var sp = stackReg.exec(s) || stackReg2.exec(s);

    if (sp && sp.length === 5) {
        return {
            method: sp[1],
            relativePath: path.relative(PROJECT_ROOT, sp[2]),
            line: sp[3],
            pos: sp[4],
            file: path.basename(sp[2]),
            stack: stacklist.join("\n"),
        };
    }
}

module.exports.log = log;
