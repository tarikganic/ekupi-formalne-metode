/**
 * Test Case 4: Dodavanje proizvoda u korpu
 * Testira funkcionalnost dodavanja proizvoda u korpu
 *
 * Preduslov: Korisnik je na stranici detalja proizvoda
 * Očekivani rezultat: Proizvod je dodan u korpu
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
	getCartItemCount,
	By,
	until,
} = require("../helpers/testSetup");

describe("Test Case 4: Dodavanje proizvoda u korpu", function () {
	this.timeout(CONFIG.TIMEOUTS.DEFAULT);

	let driver;

	before(async function () {
		driver = await initDriver();
	});

	after(async function () {
		await closeDriver(driver);
	});

	it("TC4.1 - Trebalo bi dodati proizvod u korpu sa početnom količinom", async function () {
		try {
			await driver.get(CONFIG.BASE_URL);
			await acceptCookies(driver);

			const initialCartCount = await getCartItemCount(driver);

			await searchProduct(driver, "USB");

			const firstProduct = await waitForElement(
				driver,
				By.css(".product-item a, .product-tile a, .product-listing-item a")
			);
			await safeClick(driver, firstProduct);

			await driver.wait(until.urlMatches(/\/p\/|product/i), 10000);

			let productName = "Nepoznat proizvod";
			try {
				const productTitle = await waitForElement(
					driver,
					By.css("h1.product-name, h1.product-title, .pdp-title, h1")
				);
				productName = (await productTitle.getText()).trim() || productName;
			} catch {}

			const addToCartButton = await waitForElement(
				driver,
				By.css(
					"button.add-to-cart, .btn-add-to-cart, [data-add-to-cart], button.js-add-to-cart, #addToCartButton"
				)
			);

			await driver.executeScript(
				"arguments[0].scrollIntoView({block:'center'});",
				addToCartButton
			);
			await driver.wait(until.elementIsVisible(addToCartButton), 5000);
			await driver.wait(until.elementIsEnabled(addToCartButton), 5000);

			assert(
				await addToCartButton.isEnabled(),
				"Dodaj u korpu dugme je disabled / proizvod nije dostupan"
			);

			await safeClick(driver, addToCartButton);

			let addedSuccessfully = false;
			try {
				await driver.wait(async () => {
					const newCount = await getCartItemCount(driver);
					return newCount > initialCartCount;
				}, 10000);
				addedSuccessfully = true;
			} catch (e) {
				addedSuccessfully = false;
			}

			if (!addedSuccessfully) {
				await driver.get(CONFIG.CART_URL);

				await driver.wait(async () => {
					const items = await driver.findElements(
						By.css("li.item__list--item")
					);
					return items.length > 0;
				}, 10000);

				const cartItems = await driver.findElements(
					By.css("li.item__list--item")
				);
				addedSuccessfully = cartItems.length > 0;
			}

			assert(addedSuccessfully, "Proizvod bi trebao biti dodan u korpu");

			console.log(`✓ Proizvod "${productName}" uspješno dodan u korpu`);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC4_1_dodavanje_u_korpu");
			throw error;
		}
	});

	it("TC4.2 - Trebalo bi ažurirati broj artikala u korpi nakon dodavanja", async function () {
		try {
			await driver.get(CONFIG.CART_URL);
			await driver.sleep(2000);

			try {
				const removeButtons = await driver.findElements(
					By.css(
						".remove-item, .btn-remove, [data-remove-item], .cart-item-remove"
					)
				);
				for (const btn of removeButtons) {
					await safeClick(driver, btn);
					await driver.sleep(1000);
				}
			} catch (e) {
			}

			await driver.get(CONFIG.BASE_URL);
			await driver.sleep(2000);

			await searchProduct(driver, "miš");

			const firstProduct = await waitForElement(
				driver,
				By.css(".product-item a, .product-tile a, .product-listing-item a")
			);
			await safeClick(driver, firstProduct);
			await driver.sleep(3000);

			const addToCartButton = await waitForElement(
				driver,
				By.css(
					"button.add-to-cart, .btn-add-to-cart, [data-add-to-cart], button.js-add-to-cart"
				)
			);
			await safeClick(driver, addToCartButton);
			await driver.sleep(3000);

			try {
				const closeModal = await driver.findElement(
					By.css(
						".close-modal, .modal-close, [data-dismiss='modal'], .btn-close"
					)
				);
				await safeClick(driver, closeModal);
				await driver.sleep(1000);
			} catch (e) {
			}

			await driver.get(CONFIG.CART_URL);
			const qtyInput = await waitForElement(
				driver,
				By.css("input.js-update-entry-quantity-input, input[id^='quantity_']")
			);

			const qtyValue = await qtyInput.getAttribute("value");
			const qty = parseInt(qtyValue, 10) || 0;

			assert(
				qty >= 1,
				`Količina u košarici bi trebala biti >= 1, dobijeno: ${qtyValue}`
			);
			console.log(`✓ Količina u košarici: ${qty}`);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC4_2_azuriranje_broja_korpe");
			throw error;
		}
	});
});
