const fs = require("fs");

const { login } = require("./auth");
const { crawl } = require("./crawler");
const { OUTPUT, ROOT_TOKEN } = require("./config");
const { downloadOne } = require("./downloader");
const { getFolderToken } = require("./cli");

(async () => {

    const {
        browser,
        cookieHeader
    } = await login();

    const folderToken = getFolderToken();

    const target = process.argv[2];

    // --------------------------------------------------
    // Download one folder by token or by name
    // --------------------------------------------------

    if (target) {

        if (!fs.existsSync("files.json")) {

            console.log("files.json not found.");
            console.log("Run the downloader once without arguments first.");

            await browser.close();
            return;
        }

        const entries = JSON.parse(
            fs.readFileSync("files.json", "utf8")
        );

        let folder;

        // Token?
        if (target.startsWith("fld")) {

            folder = entries.find(e =>
                e.type === "folder" &&
                e.token === target
            );

        } else {

            // Folder name
            folder = entries.find(e =>
                e.type === "folder" &&
                e.name === target
            );

        }

        if (!folder) {

            console.log("Folder not found.");

            await browser.close();
            return;

        }

        console.log(`\nDownloading folder: ${folder.name}\n`);

        const files = await crawl(
            cookieHeader,
            folder.token,
            folder.path
        );

        console.log(`Found ${files.length} files\n`);

        for (const file of files) {

            if (file.type !== "file")
                continue;

            try {

                await downloadOne(
                    cookieHeader,
                    file
                );

            } catch (err) {

                console.log(
                    `❌ ${file.name}: ${err.code || err.message}`
                );

            }

        }

        await browser.close();
        return;

    }

    // --------------------------------------------------
    // Normal mode (download everything)
    // --------------------------------------------------

    let files;

    if (fs.existsSync("files.json")) {

        console.log("\nLoading files.json...\n");

        files = JSON.parse(
            fs.readFileSync("files.json", "utf8")
        );

        const ONLY_FOLDER = "";

        if (ONLY_FOLDER) {
            files = files.filter(file =>
                file.path.includes(ONLY_FOLDER)
            );

            console.log(
                `Downloading only "${ONLY_FOLDER}" (${files.length} files)\n`
            );
        }

    } else {

        console.log("\nScanning...\n");

        files = await crawl(
            cookieHeader,
            folderToken || ROOT_TOKEN,
            OUTPUT,
            [],
            folderToken
        );



        fs.writeFileSync(
            "files.json",
            JSON.stringify(files, null, 2)
        );

        console.log("\nfiles.json saved.\n");
    }

    files = files.filter(f => f.type === "file");

    console.log(`Found ${files.length} files`);

    for (let i = 0; i < files.length; i++) {

        try {

            console.log(
                `[${i + 1}/${files.length}] ${files[i].name}`
            );

            await downloadOne(
                cookieHeader,
                files[i]
            );

        } catch (err) {

            console.log(
                `❌ ${files[i].name}: ${err.code || err.message}`
            );

        }

    }

    await browser.close();

})();