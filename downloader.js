const fs = require("fs");
const path = require("path");
const axios = require("axios");

const { getMeta, headers } = require("./api");
const { ensureDir } = require("./utils");

async function downloadOne(cookieHeader, file) {

    ensureDir(path.dirname(file.path));

    if (fs.existsSync(file.path)) {

        console.log("✓", file.name);

        return;

    }

    const MAX_RETRIES = 5;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

        try {

            console.log(
                attempt === 1
                    ? `↓ ${file.name}`
                    : `↻ ${file.name} (attempt ${attempt}/${MAX_RETRIES})`
            );

            const meta = await getMeta(
                cookieHeader,
                file.token
            );

            const version = meta.version.toString();

            const url =
                `https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/all/${file.token}/?mount_point=explorer&version=${version}`;

            const response = await axios.get(
                url,
                {
                    headers: headers(cookieHeader),
                    responseType: "stream",
                    timeout: 60000
                }
            );

            await new Promise((resolve, reject) => {

                const stream = fs.createWriteStream(file.path);

                response.data.pipe(stream);

                response.data.on("error", reject);

                stream.on("finish", resolve);

                stream.on("error", reject);

            });

            console.log("✓", file.name);

            return;

        } catch (err) {

            console.log(
                `⚠ ${file.name} failed (${err.code || err.message})`
            );

            // Delete partial file if one exists
            if (fs.existsSync(file.path)) {

                try {

                    fs.unlinkSync(file.path);

                    console.log(`🗑 Deleted partial file: ${file.name}`);

                } catch {}

            }

            if (attempt === MAX_RETRIES) {

                throw err;

            }

            // Wait 5 seconds before retrying
            await new Promise(resolve =>
                setTimeout(resolve, 5000)
            );

        }

    }

}

module.exports = {
    downloadOne
};