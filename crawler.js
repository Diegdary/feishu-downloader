const { OUTPUT } = require("./config");
const path = require("path");


const { listFolder } = require("./api");
const { ensureDir, sanitize } = require("./utils");

async function crawl(
    cookieHeader,
    token,
    currentDir,
    files = [],
    rootToken = null
) {

    ensureDir(currentDir);

    let lastLabel = null;

    while (true) {

        const data = await listFolder(
            cookieHeader,
            token,
            lastLabel
        );

        const nodes = data.entities.nodes;

        for (const id of data.node_list) {

            const item = nodes[id];

            if (!item)
                continue;

            if (
                rootToken &&
                token === rootToken &&
                currentDir === OUTPUT
            ) {

                currentDir = path.join(
                    currentDir,
                    sanitize(item.name)
                );

                ensureDir(currentDir);

            }            

            item.currentPath = currentDir;

            // Folder
            if (item.type === 0) {

                console.log("📁", item.name);

                files.push({
                    type: "folder",
                    token: item.obj_token,
                    name: item.name,
                    path: path.join(
                        currentDir,
                        sanitize(item.name)
                    )
                });

            await crawl(
                cookieHeader,
                item.obj_token,
                path.join(
                    currentDir,
                    sanitize(item.name)
                ),
                files,
                rootToken
            );

            }

            // File
            else {

                files.push({

                    type: "file",

                    token: item.obj_token,

                    name: item.name,

                    path: path.join(
                        currentDir,
                        sanitize(item.name)
                    )

                });

            }

        }

        if (!data.has_more)
            break;

        lastLabel = data.last_label;

    }

    return files;

}

module.exports = {
    crawl
};