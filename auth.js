const { chromium } = require("playwright");
const { ROOT_TOKEN, BASE_URL } = require("./config");

async function login() {

    const browser = await chromium.launch({
        headless: false
    });

    const context = await browser.newContext();

    const page = await context.newPage();

    console.log("Opening Feishu...");

    await page.goto(
        `https://bocx3373rw.feishu.cn/drive/folder/${ROOT_TOKEN}`,
        { waitUntil: "domcontentloaded" }
    );

    await page.waitForTimeout(5000);

    const cookies = await context.cookies();

    const cookieHeader =
        cookies
            .map(c => `${c.name}=${c.value}`)
            .join("; ");

    return {
        browser,
        context,
        cookieHeader
    };
}

module.exports = {
    login
};