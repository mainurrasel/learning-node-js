"use strict";

const { SCHEMA, TABLE } = require("./constant");
const Dao = require("./dao");

const convert_en_to_bn = (str) => {
    if (str == null || str.trim().length == 0 || str.trim().toLowerCase() === "null") {
        return "";
    }
    let newStr = "";
    for (let i = 0; i < str.length; i++) {
        switch (str.charAt(i)) {
            case "0":
                newStr += "০";
                break;
            case "1":
                newStr += "১";
                break;
            case "2":
                newStr += "২";
                break;
            case "3":
                newStr += "৩";
                break;
            case "4":
                newStr += "৪";
                break;
            case "5":
                newStr += "৫";
                break;
            case "6":
                newStr += "৬";
                break;
            case "7":
                newStr += "৭";
                break;
            case "8":
                newStr += "৮";
                break;
            case "9":
                newStr += "৯";
                break;
            default:
                newStr += str.charAt(i);
                break;
        }
    }
    return newStr.toString();
};

const get_access_token_from_db = async (request) => {
    let data = null;
    let access_token = request.headers["authorization"].replace("Bearer ", "").trim();
    let sql = {
        text: `select status, to_char(sign_out_time, 'YYYY-MM-DD HH24:MI:SS.MS') as sign_out_time
            from ${SCHEMA.PUBLIC}.${TABLE.LOGINLOG} 
            where 1 = 1 and access_token = $1`,
        values: [access_token],
    };
    try {
        let data_set = await Dao.get_data(request.pg, sql);
        data = data_set[0];
    } catch (e) {
        log.error(`An exception occurred while getting login log : ${e?.message}`);
    }
    return data;
};

module.exports = {
    convert_en_to_bn: convert_en_to_bn,
    get_access_token_from_db: get_access_token_from_db,
};
