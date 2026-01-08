/**
 * Test Setup Helper Module
 * Zajednički setup i teardown za sve testove eKupi.ba
 * Predmet: Formalne metode - Testiranje web aplikacije
 */

const { Builder, By, until, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const path = require("path");

// Konfiguracijski podaci
const CONFIG = {
    BASE_URL: "https://www.ekupi.ba",
    LOGIN_URL: "https://www.ekupi.ba/bs/login",
    CART_URL: "https://www.ekupi.ba/bs/cart",
    WISHLIST_URL: "https://www.ekupi.ba/bs/my-account/wishlist",
    CREDENTIALS: {
        email: "visevaj332@icousd.com",
        password: "SRrGciwbfg8!tnx"
    },
    TIMEOUTS: {
        DEFAULT: 90000,
        ELEMENT: 15000,
        PAGE_LOAD: 20000,
        SHORT: 5000
    }
};

// Screenshot direktorij
const SCREENSHOT_DIR = path.join(__dirname, "..", "screenshots");

/**
 * Kreira Chrome opcije za testiranje
 */
function getChromeOptions() {
    const options = new chrome.Options();
    options.addArguments(
        "--start-maximized",
        "--disable-extensions",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--remote-debugging-port=9222",
        "--window-size=1920,1080",
        "--disable-blink-features=AutomationControlled",
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    return options;
}

/**
 * Inicijalizira WebDriver
 */
async function initDriver() {
    const options = getChromeOptions();
    const driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();
    
    // Osiguraj da screenshot direktorij postoji
    if (!fs.existsSync(SCREENSHOT_DIR)) {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
    
    return driver;
}

/**
 * Zatvara WebDriver
 */
async function closeDriver(driver) {
    if (driver) {
        await driver.quit();
    }
}

/**
 * Snima screenshot na grešku
 */
async function takeScreenshotOnError(driver, testName) {
    try {
        const screenshot = await driver.takeScreenshot();
        const filename = `${testName.replace(/\s+/g, "_")}_${Date.now()}.png`;
        const filepath = path.join(SCREENSHOT_DIR, filename);
        fs.writeFileSync(filepath, screenshot, "base64");
        console.log(`Screenshot saved: ${filepath}`);
        return filepath;
    } catch (err) {
        console.error("Failed to take screenshot:", err.message);
        return null;
    }
}

/**
 * Prihvata kolačiće ako se pojavi modal
 */
async function acceptCookies(driver) {
    try {
        const acceptButton = await driver.wait(
            until.elementLocated(By.css("button.js-cookie-accept, .cookie-accept, [data-testid='cookie-accept']")),
            5000
        );
        await acceptButton.click();
        await driver.sleep(1000);
    } catch (e) {
        // Cookie modal se možda nije pojavio - to je OK
    }
}

/**
 * Čeka da se element učita i bude vidljiv
 */
async function waitForElement(driver, locator, timeout = CONFIG.TIMEOUTS.ELEMENT) {
    const element = await driver.wait(until.elementLocated(locator), timeout);
    await driver.wait(until.elementIsVisible(element), timeout);
    return element;
}

/**
 * Sigurni klik - pokušava normalni klik, pa JavaScript klik
 */
async function safeClick(driver, element) {
    try {
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
        await driver.sleep(500);
        await element.click();
    } catch (e) {
        await driver.executeScript("arguments[0].click();", element);
    }
}

/**
 * Čisti input polje i unosi tekst
 */
async function clearAndType(driver, element, text) {
    await driver.executeScript("arguments[0].value = '';", element);
    await element.clear();
    await element.sendKeys(text);
}

/**
 * Prijava korisnika na eKupi.ba
 */
async function login(driver) {
    await driver.get(CONFIG.LOGIN_URL);
    await driver.sleep(2000);
    
    // Prihvati kolačiće
    await acceptCookies(driver);
    
    // Pronađi i popuni email polje
    const emailInput = await waitForElement(
        driver,
        By.css("input[name='j_username'], input[type='email'], #j_username")
    );
    await clearAndType(driver, emailInput, CONFIG.CREDENTIALS.email);
    
    // Pronađi i popuni password polje
    const passwordInput = await waitForElement(
        driver,
        By.css("input[name='j_password'], input[type='password'], #j_password")
    );
    await clearAndType(driver, passwordInput, CONFIG.CREDENTIALS.password);
    
    // Klikni na button za prijavu
    const loginButton = await waitForElement(
        driver,
        By.css("button[type='submit'], .btn-login, #loginBtn")
    );
    await safeClick(driver, loginButton);
    
    // Čekaj da se stranica učita nakon prijave
    await driver.sleep(3000);
}

/**
 * Provjera da li je korisnik prijavljen
 */
async function isLoggedIn(driver) {
    try {
        await driver.wait(
            until.elementLocated(By.css(".my-account, .user-name, .logged-in, [data-user-logged]")),
            5000
        );
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Odjava korisnika
 */
async function logout(driver) {
    try {
        // Klikni na korisnički meni
        const userMenu = await waitForElement(
            driver,
            By.css(".my-account, .user-dropdown, #userMenu")
        );
        await safeClick(driver, userMenu);
        await driver.sleep(1000);
        
        // Klikni na odjavu
        const logoutLink = await waitForElement(
            driver,
            By.xpath("//a[contains(text(), 'Odjava') or contains(@href, 'logout')]")
        );
        await safeClick(driver, logoutLink);
        await driver.sleep(2000);
    } catch (e) {
        console.log("Logout failed or user not logged in");
    }
}

/**
 * Pretraga proizvoda
 */
async function searchProduct(driver, searchTerm) {
    const searchInput = await waitForElement(
        driver,
        By.css("input[name='text'], input.search-input, #search, .js-search-input")
    );
    await clearAndType(driver, searchInput, searchTerm);
    await searchInput.sendKeys(Key.RETURN);
    await driver.sleep(3000);
}

/**
 * Čeka URL da sadrži određeni string
 */
async function waitForUrlContains(driver, urlPart, timeout = CONFIG.TIMEOUTS.PAGE_LOAD) {
    await driver.wait(until.urlContains(urlPart), timeout);
}

/**
 * Dohvata broj artikala u košarici
 */
async function getCartItemCount(driver) {
    try {
        const cartBadge = await driver.findElement(
            By.css(".cart-count, .mini-cart-count, .js-mini-cart-count")
        );
        const text = await cartBadge.getText();
        return parseInt(text) || 0;
    } catch (e) {
        return 0;
    }
}

module.exports = {
    CONFIG,
    initDriver,
    closeDriver,
    takeScreenshotOnError,
    acceptCookies,
    waitForElement,
    safeClick,
    clearAndType,
    login,
    isLoggedIn,
    logout,
    searchProduct,
    waitForUrlContains,
    getCartItemCount,
    By,
    until,
    Key
};
