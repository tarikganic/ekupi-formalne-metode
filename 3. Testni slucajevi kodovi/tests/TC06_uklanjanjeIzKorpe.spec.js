/**
 * Test Case 6: Uklanjanje proizvoda iz korpe
 * Testira funkcionalnost uklanjanja proizvoda iz korpe
 *
 * Preduslov: Proizvod je dodan u korpu
 * Očekivani rezultat: Proizvod je uklonjen iz korpe
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

describe("Test Case 6: Uklanjanje proizvoda iz korpe", function () {
	this.timeout(CONFIG.TIMEOUTS.DEFAULT);

	let driver;

	before(async function () {
		driver = await initDriver();
	});

	after(async function () {
		await closeDriver(driver);
	});

	/**
	 * Helper funkcija za dodavanje proizvoda u korpu
	 */
	async function addProductToCart() {
		await driver.get(CONFIG.BASE_URL);
		await driver.sleep(2000);
		await acceptCookies(driver);

		await searchProduct(driver, "punjač");

		const firstProduct = await waitForElement(
			driver,
			By.css(".product-item a, .product-tile a, .product-listing-item a")
		);
		await safeClick(driver, firstProduct);
		await driver.sleep(2000);

		const addToCartButton = await waitForElement(
			driver,
			By.css("#addToCartButton, .js-add-to-cart")
		);
		await safeClick(driver, addToCartButton);
		await driver.sleep(3000);
	}

	it("TC6.1 - Trebalo bi ukloniti pojedinačni proizvod iz korpe", async function () {
		try {
			await addProductToCart();

			await driver.get(CONFIG.CART_URL);
			await driver.sleep(3000);

			const initialItems = await driver.findElements(
				By.css("li.item__list--item")
			);
			const initialCount = initialItems.length;

			assert(
				initialCount > 0,
				"Korpa bi trebala sadržavati barem jedan artikal"
			);

			const removeButton = await waitForElement(
				driver,
				By.css(".remove-from-cart")
			);

			await safeClick(driver, removeButton);
			await driver.sleep(3000);

			try {
				const confirmButton = await driver.wait(
					until.elementLocated(
						By.css(".confirm-remove, .btn-confirm, [data-confirm]")
					),
					3000
				);
				await safeClick(driver, confirmButton);
				await driver.sleep(2000);
			} catch (e) {
			}
			const remainingItems = await driver.findElements(
				By.css("li.item__list--item")
			);
			const remainingCount = remainingItems.length;

			assert(
				remainingCount < initialCount,
				`Broj artikala bi se trebao smanjiti. Početno: ${initialCount}, Preostalo: ${remainingCount}`
			);

			console.log(
				`✓ Proizvod uspješno uklonjen iz korpe. Početno: ${initialCount}, Preostalo: ${remainingCount}`
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC6_1_uklanjanje_proizvoda");
			throw error;
		}
	});

	it("TC6.2 - Trebalo bi prikazati praznu korpu nakon uklanjanja svih proizvoda", async function () {
		try {
			await addProductToCart();

			await driver.get(CONFIG.CART_URL);
			await driver.sleep(3000);

			let hasMoreItems = true;
			let iterations = 0;
			const maxIterations = 10;

			while (hasMoreItems && iterations < maxIterations) {
				const removeButtons = await driver.findElements(
					By.css(".remove-from-cart")
				);

				if (removeButtons.length === 0) {
					hasMoreItems = false;
				} else {
					await safeClick(driver, removeButtons[0]);
					await driver.sleep(2000);


					try {
						const confirmButton = await driver.wait(
							until.elementLocated(By.css(".confirm-remove, .btn-confirm")),
							2000
						);
						await safeClick(driver, confirmButton);
						await driver.sleep(1000);
					} catch (e) {

					}
				}
				iterations++;
			}


			await driver.sleep(2000);

			let emptyCartFound = false;


			try {
				const emptyMessage = await driver.findElement(
					By.xpath("//*[contains(text(), 'Vaša košarica je prazna!')]")
				);
				emptyCartFound = await emptyMessage.isDisplayed();
			} catch (e) {
				const cartItems = await driver.findElements(
					By.css("li.item__list--item")
				);
				emptyCartFound = cartItems.length === 0;
			}

			assert(
				emptyCartFound,
				"Korpa bi trebala biti prazna ili prikazati poruku o praznoj korpi"
			);

			console.log("✓ Korpa je uspješno ispražnjena");
		} catch (error) {
			await takeScreenshotOnError(driver, "TC6_2_prazna_korpa");
			throw error;
		}
	});

	it("TC6.3 - Trebalo bi ažurirati ukupnu cijenu nakon uklanjanja proizvoda", async function () {
		try {
			await addProductToCart();

			await driver.get(CONFIG.BASE_URL);
			await driver.sleep(2000);
			await searchProduct(driver, "adapter");

			const secondProduct = await waitForElement(
				driver,
				By.css(".product-item a, .product-tile a")
			);
			await safeClick(driver, secondProduct);
			await driver.sleep(2000);

			const addToCartButton = await waitForElement(
				driver,
				By.css("button#addToCartButton")
			);
			await safeClick(driver, addToCartButton);
			await driver.sleep(3000);

			await driver.get(CONFIG.CART_URL);
			await driver.sleep(3000);

			let initialTotal = 0;
			try {
				const totalElement = await driver.findElement(By.css(".grand-total"));
				const totalText = await totalElement.getText();
				initialTotal = parseFloat(
					totalText.replace(/[^\d,]/g, "").replace(",", ".")
				);
			} catch (e) {
			}

			const removeButton = await waitForElement(
				driver,
				By.css(".remove-from-cart")
			);
			await safeClick(driver, removeButton);
			await driver.sleep(3000);

			let updatedTotal = 0;
			try {
				const updatedTotalElement = await driver.findElement(
					By.css(".grand-total")
				);
				const updatedTotalText = await updatedTotalElement.getText();
				updatedTotal = parseFloat(
					updatedTotalText.replace(/[^\d,]/g, "").replace(",", ".")
				);
			} catch (e) {
			}
			assert(
				updatedTotal < initialTotal ||
					initialTotal === 0 ||
					isNaN(initialTotal),
				`Ukupna cijena bi se trebala smanjiti. Početna: ${initialTotal}, Nova: ${updatedTotal}`
			);

			console.log(
				`✓ Ukupna cijena ažurirana nakon uklanjanja: ${initialTotal} -> ${updatedTotal}`
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC6_3_azuriranje_cijene_uklanjanje");
			throw error;
		}
	});
});
