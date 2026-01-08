/**
 * Test Case 3: Pregled detalja proizvoda
 * Testira prikaz detaljnih informacija o proizvodu
 *
 * Preduslov: Korisnik je pretražio proizvode
 * Očekivani rezultat: Prikazuju se detalji odabranog proizvoda
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

describe("Test Case 3: Pregled detalja proizvoda", function () {
	this.timeout(CONFIG.TIMEOUTS.DEFAULT);

	let driver;

	before(async function () {
		driver = await initDriver();
	});

	after(async function () {
		await closeDriver(driver);
	});

	it("TC3.1 - Trebalo bi prikazati detalje proizvoda nakon klika na proizvod", async function () {
		try {
			await driver.get(CONFIG.BASE_URL);
			await driver.sleep(2000);
			await acceptCookies(driver);

			await searchProduct(driver, "slušalice");

			const firstProduct = await waitForElement(
				driver,
				By.css(
					".product-item a, .product-tile a, .product-listing-item a, .product-link"
				)
			);

			let productName = "";
			try {
				const productTitle = await driver.findElement(
					By.css(".name, .product-title")
				);
				productName = await productTitle.getText();
			} catch (e) {
				console.log("Nije moguće dohvatiti naziv proizvoda za verifikaciju");
			}

			await safeClick(driver, firstProduct);

			await driver.sleep(500);

			await driver.wait(
				until.urlMatches(/\/p\/|product/i),
				CONFIG.TIMEOUTS.PAGE_LOAD
			);

			const currentUrl = await driver.getCurrentUrl();
			assert(
				currentUrl.includes("/p/") || currentUrl.includes("product"),
				`URL bi trebao sadržavati '/p/' ili 'product', dobijeno: ${currentUrl}`
			);

			const productDetailName = await waitForElement(
				driver,
				By.css(".code, .product-title, h1.product-name, .product-detail-name")
			);
			const detailName = await productDetailName.getText();
			try {
				console.log(detailName);
			} catch (e) {
				console.log("Nije moguće ispisati naziv proizvoda iz detalja");
			}

			assert(detailName.length > 0, "Naziv proizvoda bi trebao biti prikazan");

			const productPrice = await waitForElement(
				driver,
				By.css(".main-price-block")
			);
			const priceText = await productPrice.getText();

			assert(
				priceText.includes("KM") || priceText.match(/\d/),
				`Cijena proizvoda bi trebala biti prikazana, dobijeno: ${priceText}`
			);
			const addToCartButton = await waitForElement(
				driver,
				By.css(
					"button.add-to-cart, .btn-add-to-cart, [data-add-to-cart], button[type='submit']"
				)
			);
			const buttonDisplayed = await addToCartButton.isDisplayed();

			assert(
				buttonDisplayed,
				"Dugme za dodavanje u korpu bi trebalo biti vidljivo"
			);

			console.log(
				`✓ Detalji proizvoda "${detailName}" uspješno prikazani sa cijenom: ${priceText}`
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC3_1_detalji_proizvoda");
			throw error;
		}
	});

	it("TC3.2 - Trebalo bi prikazati specifikacije proizvoda", async function () {
		try {
			await driver.get(CONFIG.BASE_URL);
			await driver.sleep(2000);
			await acceptCookies(driver);

			await searchProduct(driver, "mobitel");

			const firstProduct = await waitForElement(
				driver,
				By.css(".product-item a, .product-tile a, .product-listing-item a")
			);
			await safeClick(driver, firstProduct);
			await driver.sleep(3000);

			let specificationsFound = false;

			try {
				const specTab = await driver.findElement(
					By.xpath(
						"//a[contains(text(), 'Specifikacije') or contains(text(), 'Karakteristike') or contains(text(), 'Opis')]"
					)
				);
				await safeClick(driver, specTab);
				await driver.sleep(1000);
				specificationsFound = true;
			} catch (e) {}
			const specElements = await driver.findElements(
				By.css(
					".product-specifications, .specifications, .product-description, .product-details-tab, table.specifications"
				)
			);

			if (specElements.length === 0) {
				const description = await driver.findElements(
					By.css(".description, .product-info, [itemprop='description']")
				);
				specificationsFound = description.length > 0;
			} else {
				specificationsFound = true;
			}

			assert(
				specificationsFound || specElements.length > 0,
				"Specifikacije ili opis proizvoda bi trebali biti dostupni"
			);

			console.log(
				"✓ Specifikacije/opis proizvoda su dostupni na stranici detalja"
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC3_2_specifikacije_proizvoda");
			throw error;
		}
	});

	it("TC3.3 - Trebalo bi prikazati slike proizvoda", async function () {
		try {
			await driver.get(CONFIG.BASE_URL);
			await driver.sleep(2000);
			await acceptCookies(driver);

			await searchProduct(driver, "televizor");

			const firstProduct = await waitForElement(
				driver,
				By.css(".product-item a, .product-tile a, .product-listing-item a")
			);
			await safeClick(driver, firstProduct);
			await driver.sleep(3000);

			const mainImage = await waitForElement(
				driver,
				By.css(
					".image-gallery__image img.lazyOwl, .js-gallery img, .image-gallery img"
				)
			);

			const imageSrc = await mainImage.getAttribute("src");

			assert(
				imageSrc && imageSrc.length > 0,
				"Glavna slika proizvoda bi trebala imati src atribut"
			);

			assert(
				imageSrc.includes("http") || imageSrc.includes("data:image"),
				`Slika bi trebala imati validan URL, dobijeno: ${imageSrc.substring(
					0,
					50
				)}...`
			);
			const thumbnails = await driver.findElements(
				By.css(".gallery-carousel img, .js-gallery-carousel img")
			);

			console.log(
				`✓ Pronađena glavna slika i ${thumbnails.length} thumbnail slika`
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC3_3_slike_proizvoda");
			throw error;
		}
	});
});
