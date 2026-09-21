const axios = require("axios");

const JSONbig = require("json-bigint")({
    useNativeBigInt: false
});

const { BASE_URL } = require("./config");

function headers(cookieHeader) {

    return {

        cookie: cookieHeader,

        referer: BASE_URL + "/",

        "user-agent": "Mozilla/5.0"

    };

}

async function listFolder(cookieHeader, token, lastLabel = null) {

    const url = new URL(
        `${BASE_URL}/space/api/explorer/v3/children/list/`
    );

    url.searchParams.set("thumbnail_width", "1028");
    url.searchParams.set("thumbnail_height", "1028");
    url.searchParams.set("thumbnail_policy", "4");

    [
        0,
        2,
        22,
        44,
        3,
        30,
        8,
        11,
        12,
        84,
        123,
        124
    ].forEach(t =>
        url.searchParams.append("obj_type", t)
    );

    url.searchParams.set("length", "50");
    url.searchParams.set("asc", "1");
    url.searchParams.set("rank", "5");
    url.searchParams.set("token", token);
    url.searchParams.set("thumbnail_mode", "0");

    if (lastLabel)
        url.searchParams.set("last_label", lastLabel);

    const res = await axios.get(
        url.toString(),
        {
            headers: headers(cookieHeader),
            responseType: "text"
        }
    );

    return JSONbig.parse(res.data).data;

}

async function getMeta(cookieHeader, token) {

    const url =
`${BASE_URL}/space/api/meta/?token=${token}&type=12`;

    const res = await axios.get(url, {

        headers: headers(cookieHeader),

        responseType: "text"

    });

    return JSONbig.parse(res.data).data;

}

module.exports = {
    listFolder,
    getMeta,
    headers
};