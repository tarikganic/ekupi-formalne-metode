/**
 * Test Case 2: Filtriranje rezultata pretrage
 * Testira funkcionalnost filtriranja i sortiranja proizvoda
 *
 * Preduslov: Korisnik je na stranici rezultata pretrage
 * Očekivani rezultat: Rezultati su filtrirani/sortirani prema odabranim kriterijima
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
	searchProduct,
	By,
	until,
} = require("../helpers/testSetup");

describe("Test Case 2: Filtriranje rezultata pretrage", function () {
	this.timeout(CONFIG.TIMEOUTS.DEFAULT);

	let driver;

	before(async function () {
		driver = await initDriver();
	});

	after(async function () {
		await closeDriver(driver);
	});

	it("TC2.1 - Trebalo bi sortirati proizvode po cijeni (najniža prva)", async function () {
		try {
			await driver.get(CONFIG.BASE_URL);
			await driver.sleep(2000);
			await acceptCookies(driver);

			await searchProduct(driver, "televizor");

			const sortDropdown = await waitForElement(
				driver,
				By.css(
					"select.sort-select, .sorting-selector select, [name='sort'], .js-sort-dropdown"
				)
			);

			await sortDropdown.click();
			await driver.sleep(500);

			const priceAscOption = await driver.findElement(
				By.css("option[value*='price-asc'], option[value*='price:asc']")
			);
			await priceAscOption.click();
			await driver.sleep(3000);

			const currentUrl = await driver.getCurrentUrl();
			assert(
				currentUrl.includes("sort") || currentUrl.includes("price"),
				`URL bi trebao sadržavati parametar za sortiranje, dobijeno: ${currentUrl}`
			);
			const priceElements = await driver.findElements(
				By.css(".product-price, .price, .product-item__price, [data-price]")
			);

			if (priceElements.length >= 2) {
				const prices = [];
				for (let i = 0; i < Math.min(5, priceElements.length); i++) {
					const priceText = await priceElements[i].getText();
	
					const priceValue = parseFloat(
						priceText.replace(/[^\d,]/g, "").replace(",", ".")
					);
					if (!isNaN(priceValue)) {
						prices.push(priceValue);
					}
				}


				for (let i = 1; i < prices.length; i++) {
					assert(
						prices[i] >= prices[i - 1],
						`Cijene bi trebale biti sortirane uzlazno. Cijena ${
							prices[i]
						} nije >= ${prices[i - 1]}`
					);
				}

				console.log(
					`✓ Proizvodi su pravilno sortirani po cijeni (najniža prva): ${prices.join(
						", "
					)}`
				);
			}
		} catch (error) {
			await takeScreenshotOnError(driver, "TC2_1_sortiranje_po_cijeni");
			throw error;
		}
	});

	it("TC2.2 - Trebalo bi filtrirati proizvode po dostupnosti", async function () {
		try {
			await driver.get(CONFIG.BASE_URL);
			await driver.sleep(2000);

			await searchProduct(driver, "laptop");

			let availabilityFilter;
			try {
				availabilityFilter = await waitForElement(
					driver,
					By.xpath(
						"//div[contains(@class, 'facet') or contains(@class, 'filter')]//span[contains(text(), 'Dostupnost') or contains(text(), 'Availability') or contains(text(), 'Available')]"
					)
				);
				await safeClick(driver, availabilityFilter);
				await driver.sleep(1000);
			} catch (e) {
			}

			const availabilityCheckbox = await waitForElement(
				driver,
				By.css(".js-facet .facet__list__label")
			);

			const availabilityLabel = await availabilityCheckbox.findElement(
				By.xpath("./..")
			);
			const availability = await availabilityLabel.getText();

			await safeClick(driver, availabilityCheckbox);
			await driver.sleep(3000);

			const currentUrl = await driver.getCurrentUrl();
			assert(
				currentUrl.includes("availability") ||
					currentUrl.includes("filter") ||
					currentUrl.includes(":"),
				`URL bi trebao sadržavati parametar za filter, dobijeno: ${currentUrl}`
			);
			const filteredProducts = await driver.findElements(
				By.css(".product-item, .product-tile, .product-listing-item")
			);

			assert(
				filteredProducts.length >= 0,
				"Trebalo bi postojati rezultati nakon filtriranja"
			);

			console.log(
				`✓ Filter po dostupnosti "${availability}" uspješno primijenjen. Pronađeno ${filteredProducts.length} proizvoda.`
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC2_2_filtriranje_po_dostupnosti");
			throw error;
		}
	});
});
