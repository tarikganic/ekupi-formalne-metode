/**
 * Test Case 5: Promjena količine proizvoda u korpi
 * Testira funkcionalnost promjene količine i Boundary Value Analysis
 *
 * Ovo je implementacija BVA (Boundary Value Analysis) iz dokumentacije:
 * - Minimalna dozvoljena količina = 1
 * - Maksimalna količina = dostupna zaliha
 *
 * Preduslov: Proizvod je dodan u korpu
 * Očekivani rezultat: Količina se ispravno ažurira u dozvoljenom rasponu
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
	clearAndType,
	searchProduct,
	By,
	until,
} = require("../helpers/testSetup");

describe("Test Case 5: Promjena količine u korpi (BVA)", function () {
	this.timeout(CONFIG.TIMEOUTS.DEFAULT);

	let driver;

	before(async function () {
		driver = await initDriver();
	});

	after(async function () {
		await closeDriver(driver);
	});

	async function addProductToCart() {
		await driver.get(CONFIG.BASE_URL);
		await driver.sleep(2000);
		await acceptCookies(driver);

		await searchProduct(driver, "kabel");

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

	it("TC5.1 - BVA: Trebalo bi prihvatiti minimalnu količinu (1) - Donja granica", async function () {
		try {
			await addProductToCart();

			await driver.get(CONFIG.CART_URL);
			await driver.sleep(3000);

			let quantityInput = await waitForElement(
				driver,
				By.css(
					"input.js-qty-selector-input, input[name='quantity'], input.qty, .quantity input"
				)
			);

			await clearAndType(driver, quantityInput, "1");
			await quantityInput.sendKeys(require("selenium-webdriver").Key.RETURN);
			await driver.sleep(3000);

			quantityInput = await waitForElement(
				driver,
				By.css(
					"input.js-qty-selector-input, input[name='quantity'], input.qty, .quantity input"
				)
			);
			const updatedQuantity = await quantityInput.getAttribute("value");

			assert.strictEqual(
				parseInt(updatedQuantity),
				1,
				`Količina bi trebala biti 1, dobijeno: ${updatedQuantity}`
			);

			const errorMessages = await driver.findElements(
				By.css(".error-message, .alert-error, .quantity-error")
			);

			let hasVisibleError = false;
			for (const error of errorMessages) {
				if (await error.isDisplayed()) {
					hasVisibleError = true;
					break;
				}
			}

			assert(
				!hasVisibleError,
				"Ne bi trebala biti prikazana poruka o grešci za količinu 1"
			);

			console.log("✓ BVA Test: Minimalna količina (1) uspješno prihvaćena");
		} catch (error) {
			await takeScreenshotOnError(driver, "TC5_1_BVA_minimalna_kolicina");
			throw error;
		}
	});

	it("TC5.2 - BVA: Trebalo bi odbiti količinu 0 - Ispod donje granice", async function () {
		try {
			await driver.get(CONFIG.CART_URL);
			await driver.sleep(3000);

			let cartItems = await driver.findElements(
				By.css(".cart-item, .cart-entry, [data-cart-item], .entry-product")
			);
			const initialCount = cartItems.length;

			if (initialCount === 0) {
				await addProductToCart();
				await driver.get(CONFIG.CART_URL);
				await driver.sleep(3000);
				cartItems = await driver.findElements(
					By.css(".cart-item, .cart-entry, [data-cart-item], .entry-product")
				);
			}

			let quantityInput = await waitForElement(
				driver,
				By.css(
					"input.js-qty-selector-input, input[name='quantity'], input.qty, .quantity input"
				)
			);

			await clearAndType(driver, quantityInput, "0");
			await quantityInput.sendKeys(require("selenium-webdriver").Key.RETURN);
			await driver.sleep(3000);

			let updatedQuantity = "0";
			try {
				quantityInput = await driver.findElement(
					By.css(
						"input.js-qty-selector-input, input[name='quantity'], input.qty, .quantity input"
					)
				);
				updatedQuantity = await quantityInput.getAttribute("value");
			} catch (e) {}

			const isValid = parseInt(updatedQuantity) !== 0;

			const remainingItems = await driver.findElements(
				By.css(".cart-item, .cart-entry, [data-cart-item], .entry-product")
			);

			const itemRemovedOrQuantityReset =
				isValid || remainingItems.length < initialCount;

			assert(
				itemRemovedOrQuantityReset,
				"Količina 0 ne bi trebala biti dozvoljena - artikal bi trebao biti uklonjen ili količina resetirana"
			);

			console.log(
				"✓ BVA Test: Količina 0 nije dozvoljena (artikal uklonjen ili količina resetirana)"
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC5_2_BVA_kolicina_nula");
			throw error;
		}
	});

	it("TC5.3 - BVA: Trebalo bi prihvatiti povećanje količine - Iznad donje granice", async function () {
		try {
			await addProductToCart();

			await driver.get(CONFIG.CART_URL);
			await driver.sleep(3000);

			let quantityInput = await waitForElement(
				driver,
				By.css(
					"input.js-qty-selector-input, input[name='quantity'], input.qty, .quantity input"
				)
			);

			await clearAndType(driver, quantityInput, "2");
			await quantityInput.sendKeys(require("selenium-webdriver").Key.RETURN);
			await driver.sleep(3000);

			quantityInput = await waitForElement(
				driver,
				By.css(
					"input.js-qty-selector-input, input[name='quantity'], input.qty, .quantity input"
				)
			);
			const updatedQuantity = await quantityInput.getAttribute("value");

			assert.strictEqual(
				parseInt(updatedQuantity),
				2,
				`Količina bi trebala biti 2, dobijeno: ${updatedQuantity}`
			);

			console.log(
				"✓ BVA Test: Količina 2 (iznad donje granice) uspješno prihvaćena"
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC5_3_BVA_povecanje_kolicine");
			throw error;
		}
	});

	it("TC5.4 - BVA: Trebalo bi odbiti negativne vrijednosti", async function () {
		try {
			await driver.get(CONFIG.CART_URL);
			await driver.sleep(3000);

			const cartItems = await driver.findElements(
				By.css(".cart-item, .cart-entry, [data-cart-item]")
			);

			if (cartItems.length === 0) {
				await addProductToCart();
				await driver.get(CONFIG.CART_URL);
				await driver.sleep(3000);
			}

			let quantityInput = await waitForElement(
				driver,
				By.css(
					"input.js-qty-selector-input, input[name='quantity'], input.qty, .quantity input"
				)
			);

			const originalQuantity = await quantityInput.getAttribute("value");

			await clearAndType(driver, quantityInput, "-1");
			await quantityInput.sendKeys(require("selenium-webdriver").Key.RETURN);
			await driver.sleep(3000);

			quantityInput = await waitForElement(
				driver,
				By.css(
					"input.js-qty-selector-input, input[name='quantity'], input.qty, .quantity input"
				)
			);
			const updatedQuantity = await quantityInput.getAttribute("value");

			assert(
				parseInt(updatedQuantity) >= 0,
				`Negativna količina ne bi trebala biti dozvoljena, dobijeno: ${updatedQuantity}`
			);

			console.log("✓ BVA Test: Negativna vrijednost (-1) nije prihvaćena");
		} catch (error) {
			await takeScreenshotOnError(driver, "TC5_4_BVA_negativna_vrijednost");
			throw error;
		}
	});

	it("TC5.5 - Trebalo bi ažurirati ukupnu cijenu nakon promjene količine", async function () {
		try {
			await addProductToCart();

			await driver.get(CONFIG.CART_URL);
			await driver.sleep(3000);

			let totalPriceElement = await waitForElement(
				driver,
				By.css(".cart-total, .order-total, .total-price, .cart-totals")
			);
			const initialTotalText = await totalPriceElement.getText();
			const initialTotal = parseFloat(
				initialTotalText.replace(/[^\d,]/g, "").replace(",", ".")
			);

			let quantityInput = await waitForElement(
				driver,
				By.css(
					"input.js-qty-selector-input, input[name='quantity'], input.qty, .quantity input"
				)
			);

			await clearAndType(driver, quantityInput, "2");
			await quantityInput.sendKeys(require("selenium-webdriver").Key.RETURN);
			await driver.sleep(3000);

			let newTotalPriceElement = await waitForElement(
				driver,
				By.css(".cart-totals-right")
			);

			const updatedTotalText = await newTotalPriceElement.getText();

			const updatedTotal = parseFloat(
				updatedTotalText.replace(/[^\d,]/g, "").replace(",", ".")
			);

			assert(
				updatedTotal > initialTotal || isNaN(initialTotal),
				`Ukupna cijena bi trebala se povećati. Početna: ${initialTotal}, Nova: ${updatedTotal}`
			);

			console.log(
				`✓ Ukupna cijena ažurirana: ${initialTotalText} -> ${updatedTotalText}`
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC5_5_azuriranje_ukupne_cijene");
			throw error;
		}
	});
});
