function getFolderToken() {

    const args = process.argv.slice(2);

    const index = args.indexOf("--folder");

    if (index === -1)
        return null;

    return args[index + 1] || null;

}

module.exports = {
    getFolderToken
};