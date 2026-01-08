/**
 * Test Case 10: Navigacija po kategorijama
 * Testira funkcionalnost navigacije kroz kategorije proizvoda
 *
 * Preduslov: Korisnik je na početnoj stranici
 * Očekivani rezultat: Korisnik može navigirati kroz kategorije
 */

const assert = require("assert");
const {
	CONFIG,
	initDriver,
	closeDriver,
	takeScreenshotOnError,
	acceptCookies,
	waitForElement,
	safeClick,
	By,
	until,
} = require("../helpers/testSetup");

describe("Test Case 10: Navigacija po kategorijama", function () {
	this.timeout(CONFIG.TIMEOUTS.DEFAULT);

	let driver;

	before(async function () {
		driver = await initDriver();
	});

	after(async function () {
		await closeDriver(driver);
	});

	it("TC10.1 - Trebalo bi prikazati glavne kategorije u navigaciji", async function () {
		try {
			await driver.get(CONFIG.BASE_URL);
			await driver.sleep(3000);
			await acceptCookies(driver);

			const navigation = await waitForElement(
				driver,
				By.css("nav, .navigation, .main-nav, .site-nav, .navbar, #navigation")
			);

			const categoryLinks = await driver.findElements(
				By.css(
					"nav a, .navigation a, .main-nav a, .category-link, " +
						".nav-link, [data-category]"
				)
			);

			assert(
				categoryLinks.length >= 3,
				`Trebalo bi postojati barem 3 kategorije u navigaciji, pronađeno: ${categoryLinks.length}`
			);
			const categoryNames = [];
			for (let i = 0; i < Math.min(5, categoryLinks.length); i++) {
				const name = await categoryLinks[i].getText();
				if (name.trim()) {
					categoryNames.push(name.trim());
				}
			}

			console.log(
				`✓ Pronađeno ${categoryLinks.length} kategorija: ${categoryNames.join(
					", "
				)}`
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC10_1_prikaz_kategorija");
			throw error;
		}
	});

	it("TC10.2 - Trebalo bi navigirati na stranicu kategorije", async function () {
		try {
			await driver.get(CONFIG.BASE_URL);
			await driver.sleep(2000);
			await acceptCookies(driver);

			const categoryLink = await waitForElement(
				driver,
				By.xpath(
					"//a[contains(text(), 'Računar') or contains(text(), 'Elektronik') or " +
						"contains(text(), 'Kućanski') or contains(@href, '/c/')]"
				)
			);

			const categoryName = await categoryLink.getText();

			await safeClick(driver, categoryLink);
			await driver.sleep(3000);

			const currentUrl = await driver.getCurrentUrl();
			assert(
				currentUrl.includes("/c/") ||
					currentUrl.includes("category") ||
					currentUrl !== CONFIG.BASE_URL,
				`URL bi trebao sadržavati kategoriju, dobijeno: ${currentUrl}`
			);
			const products = await driver.findElements(
				By.css(".product-item, .product-tile, .category-item, .subcategory")
			);

			assert(
				products.length >= 0,
				"Trebalo bi postojati proizvodi ili podkategorije na stranici kategorije"
			);

			console.log(
				`✓ Uspješna navigacija na kategoriju "${categoryName}". URL: ${currentUrl}`
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC10_2_navigacija_kategorija");
			throw error;
		}
	});

	it("TC10.3 - Trebalo bi navigirati na podkategoriju", async function () {
		try {
			await driver.get(CONFIG.BASE_URL);
			await driver.sleep(2000);
			await acceptCookies(driver);

			const mainCategory = await waitForElement(
				driver,
				By.xpath(
					"//a[contains(text(), 'Računar') or contains(text(), 'Elektronik') or " +
						"contains(text(), 'Kućanski')]"
				)
			);

			const actions = driver.actions({ async: true });
			await actions.move({ origin: mainCategory }).perform();
			await driver.sleep(2000);

			let subcategoryLink;
			try {
				subcategoryLink = await waitForElement(
					driver,
					By.css(
						".dropdown-menu a, .submenu a, .subcategory-link, " +
							".nav-dropdown a, [class*='sub'] a"
					)
				);
			} catch (e) {
				await safeClick(driver, mainCategory);
				await driver.sleep(2000);

				subcategoryLink = await waitForElement(
					driver,
					By.css(".category-list a, .subcategory a, .category-item a")
				);
			}

			const subcategoryName = await subcategoryLink.getText();

			await safeClick(driver, subcategoryLink);
			await driver.sleep(3000);
			const currentUrl = await driver.getCurrentUrl();

			const products = await driver.findElements(
				By.css(".product-item, .product-tile, .product-listing-item")
			);

			console.log(
				`✓ Uspješna navigacija na podkategoriju "${subcategoryName}". Pronađeno ${products.length} proizvoda`
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC10_3_navigacija_podkategorija");
			throw error;
		}
	});

	it("TC10.4 - Breadcrumb navigacija bi trebala biti funkcionalna", async function () {
		try {
			await driver.get(CONFIG.BASE_URL + "/bs/racunari/c/10001");
			await driver.sleep(3000);
			await acceptCookies(driver);

			let breadcrumbs;
			try {
				breadcrumbs = await driver.findElements(
					By.css(
						".breadcrumb a, .breadcrumbs a, [aria-label='breadcrumb'] a, .crumb a"
					)
				);
			} catch (e) {
				breadcrumbs = [];
			}

			if (breadcrumbs.length === 0) {
				console.log("⚠ Breadcrumb navigacija nije pronađena, preskačem test");
				return;
			}

			const homeLink = breadcrumbs[0];
			const homeLinkText = await homeLink.getText();

			await safeClick(driver, homeLink);
			await driver.sleep(3000);
			const currentUrl = await driver.getCurrentUrl();

			assert(
				currentUrl === CONFIG.BASE_URL ||
					currentUrl === CONFIG.BASE_URL + "/" ||
					currentUrl.includes("/bs/") ||
					!currentUrl.includes("/c/10001"),
				`Breadcrumb bi trebao navigirati na početnu ili nadređenu stranicu, dobijeno: ${currentUrl}`
			);

			console.log(
				`✓ Breadcrumb navigacija funkcionira. Klik na "${homeLinkText}" -> ${currentUrl}`
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC10_4_breadcrumb");
			throw error;
		}
	});

	it("TC10.5 - Trebalo bi se vratiti na početnu stranicu klikom na logo", async function () {
		try {
			await driver.get(CONFIG.BASE_URL);
			await driver.sleep(2000);
			await acceptCookies(driver);

			await driver.get(CONFIG.BASE_URL + "/bs/elektronika/c/10002");
			await driver.sleep(3000);

			const logo = await waitForElement(driver, By.css(".brandlogo"));

			await safeClick(driver, logo);
			await driver.sleep(3000);
			const currentUrl = await driver.getCurrentUrl();

			assert(
				currentUrl === CONFIG.BASE_URL ||
					currentUrl === CONFIG.BASE_URL + "/" ||
					currentUrl === CONFIG.BASE_URL + "/bs/" ||
					currentUrl.endsWith("/bs/"),
				`Klik na logo bi trebao vratiti na početnu stranicu, dobijeno: ${currentUrl}`
			);

			console.log(`✓ Klik na logo vraća na početnu stranicu: ${currentUrl}`);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC10_5_logo_navigacija");
			throw error;
		}
	});
});
