/**
 * Test Case 1: Pretraga proizvoda
 * Testira funkcionalnost pretrage proizvoda na eKupi.ba
 *
 * Preduslov: Korisnik je na početnoj stranici eKupi.ba
 * Očekivani rezultat: Prikazuju se rezultati pretrage za uneseni pojam
 */

const assert = require("assert");
const {
	CONFIG,
	initDriver,
	closeDriver,
	takeScreenshotOnError,
	acceptCookies,
	waitForElement,
	searchProduct,
	By,
	until,
} = require("../helpers/testSetup");

describe("Test Case 1: Pretraga proizvoda", function () {
	this.timeout(CONFIG.TIMEOUTS.DEFAULT);

	let driver;

	before(async function () {
		driver = await initDriver();
	});

	after(async function () {
		await closeDriver(driver);
	});

	it("TC1.1 - Trebalo bi uspješno pretražiti proizvode sa validnim pojmom", async function () {
		const searchTerm = "laptop";

		try {
			await driver.get(CONFIG.BASE_URL);
			await driver.sleep(2000);

			await acceptCookies(driver);

			await searchProduct(driver, searchTerm);

			const currentUrl = await driver.getCurrentUrl();
			assert(
				currentUrl.toLowerCase().includes("search") ||
					currentUrl.toLowerCase().includes("text=") ||
					currentUrl.toLowerCase().includes("/c/") ||
					currentUrl.toLowerCase().includes(searchTerm.toLowerCase()),
				`URL bi trebao sadržavati rezultate pretrage, dobijeno: ${currentUrl}`
			);

			const searchResults = await driver.wait(
				until.elementsLocated(
					By.css(
						".product-item, .product-tile, .product-listing-item, [data-product-id]"
					)
				),
				CONFIG.TIMEOUTS.ELEMENT
			);

			assert(
				searchResults.length > 0,
				"Trebalo bi biti prikazano barem jedan proizvod u rezultatima pretrage"
			);

			const pageTitle = await driver.getTitle();
			assert(
				pageTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
					pageTitle.toLowerCase().includes("pretraga") ||
					pageTitle.toLowerCase().includes("search"),
				`Naslov stranice bi trebao sadržavati pojam pretrage, dobijeno: ${pageTitle}`
			);

			console.log(
				`✓ Pronađeno ${searchResults.length} proizvoda za pojam "${searchTerm}"`
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC1_1_pretraga_proizvoda");
			throw error;
		}
	});

	it("TC1.2 - Trebalo bi prikazati odgovarajuću poruku za pretragu bez rezultata", async function () {
		const searchTerm = "xyznonexistent12345";

		try {
			await driver.get(CONFIG.BASE_URL);
			await driver.sleep(2000);

			await searchProduct(driver, searchTerm);

			let noResultsFound = false;

			try {
				const noResultsMessage = await driver.wait(
					until.elementLocated(By.css(".search-empty")),
					5000
				);
				noResultsFound = await noResultsMessage.isDisplayed();
			} catch (e) {
				const products = await driver.findElements(
					By.css(".product-item, .product-tile, .product-listing-item")
				);
				noResultsFound = products.length === 0;
			}

			assert(
				noResultsFound,
				"Trebala bi se prikazati poruka o nepostojanju rezultata ili prazna lista"
			);

			console.log(
				`✓ Pravilno prikazana poruka za nepostojeći pojam "${searchTerm}"`
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC1_2_pretraga_bez_rezultata");
			throw error;
		}
	});
});
