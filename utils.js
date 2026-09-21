const fs = require("fs");

function ensureDir(dir) {
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
}

function sanitize(name) {
    return name.replace(/[<>:"|?*]/g, "_");
}

module.exports = {
    ensureDir,
    sanitize
};