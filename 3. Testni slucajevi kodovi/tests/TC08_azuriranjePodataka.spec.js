/**
 * Test Case 8: Ažuriranje ličnih podataka
 * Testira funkcionalnost ažuriranja korisničkih podataka u profilu
 *
 * Preduslov: Korisnik je prijavljen
 * Očekivani rezultat: Lični podaci su uspješno ažurirani
 *
 * Dostupne stranice u "Moj račun":
 * - Istorija Narudžbi: /bs/my-account/orders
 * - Sačuvane košarice: /bs/my-account/saved-carts
 * - Ažurirajte Lične Podatke: /bs/my-account/update-profile
 * - Promjena lozinke: /bs/my-account/update-password
 * - Podaci O Plaćanju: /bs/my-account/payment-details
 * - Gašenje profila: /bs/my-account/close-account
 * - Dodaj adresu: /bs/my-account/add-address
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
	By,
	until,
} = require("../helpers/testSetup");

describe("Test Case 8: Ažuriranje ličnih podataka", function () {
	this.timeout(CONFIG.TIMEOUTS.DEFAULT);

	let driver;

	before(async function () {
		driver = await initDriver();
	});

	after(async function () {
		await closeDriver(driver);
	});

	/**
	 * Helper funkcija za prijavu korisnika
	 */
	async function loginUser() {
		await driver.get(CONFIG.LOGIN_URL);
		await driver.sleep(2000);
		await acceptCookies(driver);

		const emailInput = await waitForElement(
			driver,
			By.css("input[name='j_username'], input[type='email'], #j_username")
		);
		await clearAndType(driver, emailInput, CONFIG.CREDENTIALS.email);

		const passwordInput = await waitForElement(
			driver,
			By.css("input[name='j_password'], input[type='password'], #j_password")
		);
		await clearAndType(driver, passwordInput, CONFIG.CREDENTIALS.password);

		const loginButton = await waitForElement(
			driver,
			By.css("button#submit.btn.btn-primary")
		);
		await safeClick(driver, loginButton);
		await driver.sleep(5000);
	}

	it("TC8.1 - Trebalo bi prikazati bočni meni 'Moj račun' sa svim opcijama", async function () {
		try {
			await loginUser();

			await driver.get(CONFIG.BASE_URL + "/bs/my-account/orders");
			await driver.sleep(3000);

			const sideMenu = await waitForElement(
				driver,
				By.css(".account-nav_left, #accountNavLinks, .accNav")
			);

			const menuLinks = await driver.findElements(
				By.css(".accLinkList li a, .nav-left a")
			);

			assert(
				menuLinks.length >= 5,
				`Trebalo bi biti najmanje 5 opcija u meniju, pronađeno: ${menuLinks.length}`
			);

			var updateProfileLink = null;
			for (let link of menuLinks) {
				const text = (await link.getText()).trim();
				console.log(`-- Meni opcija: ${text}`);

				if (text === "Ažurirajte Lične Podatke") {
					updateProfileLink = link;
					break;
				}
			}
			assert(
				await updateProfileLink.isDisplayed(),
				"Link 'Ažurirajte Lične Podatke' bi trebao biti vidljiv"
			);

			console.log(`✓ Bočni meni prikazan sa ${menuLinks.length} opcija`);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC8_1_bocni_meni");
			throw error;
		}
	});

	it("TC8.2 - Trebalo bi otvoriti stranicu za ažuriranje ličnih podataka", async function () {
		try {
			await loginUser();

			await driver.get(CONFIG.BASE_URL + "/bs/my-account/update-profile");
			await driver.sleep(3000);

			const currentUrl = await driver.getCurrentUrl();
			assert(
				currentUrl.includes("update-profile"),
				`URL bi trebao sadržavati 'update-profile', dobijeno: ${currentUrl}`
			);
			const inputFields = await driver.findElements(
				By.css(
					"input[type='text'], input[type='email'], input[type='tel'], select"
				)
			);

			assert(
				inputFields.length > 0,
				"Trebala bi postojati polja za unos podataka"
			);

			console.log(
				`✓ Stranica za ažuriranje profila učitana sa ${inputFields.length} polja`
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC8_2_update_profile_stranica");
			throw error;
		}
	});

	it("TC8.3 - Trebalo bi navigirati na stranicu za ažuriranje putem bočnog menija", async function () {
		try {
			await loginUser();

			await driver.get(CONFIG.BASE_URL + "/bs/my-account/orders");
			await driver.sleep(3000);

			const menuLinks = await driver.findElements(
				By.css(".accLinkList li a, .nav-left a")
			);

			var updateLink = null;
			for (let link of menuLinks) {
				const text = (await link.getText()).trim();
				console.log(`-- Meni opcija: ${text}`);

				if (text === "Ažurirajte Lične Podatke") {
					updateLink = link;
					break;
				}
			}
			await safeClick(driver, updateLink);
			await driver.sleep(3000);
			const currentUrl = await driver.getCurrentUrl();
			assert(
				currentUrl.includes("update-profile"),
				`Trebalo bi biti na stranici update-profile, dobijeno: ${currentUrl}`
			);

			console.log("✓ Navigacija putem bočnog menija funkcionira");
		} catch (error) {
			await takeScreenshotOnError(driver, "TC8_3_navigacija_meni");
			throw error;
		}
	});

	it("TC8.4 - Trebalo bi otvoriti stranicu za dodavanje nove adrese", async function () {
		try {
			await loginUser();

			await driver.get(CONFIG.BASE_URL + "/bs/my-account/add-address");
			await driver.sleep(3000);

			const currentUrl = await driver.getCurrentUrl();
			assert(
				currentUrl.includes("add-address") || currentUrl.includes("address"),
				`URL bi trebao sadržavati 'add-address', dobijeno: ${currentUrl}`
			);
			const addressForm = await driver.findElements(
				By.css(
					"form, input[name*='address'], input[name*='street'], input[name*='city']"
				)
			);

			assert(
				addressForm.length > 0,
				"Trebala bi postojati forma za unos adrese"
			);

			console.log("✓ Stranica za dodavanje adrese učitana");
		} catch (error) {
			await takeScreenshotOnError(driver, "TC8_4_add_address");
			throw error;
		}
	});

	it("TC8.5 - Trebalo bi otvoriti stranicu za promjenu lozinke", async function () {
		try {
			await loginUser();

			await driver.get(CONFIG.BASE_URL + "/bs/my-account/update-password");
			await driver.sleep(3000);

			const currentUrl = await driver.getCurrentUrl();
			assert(
				currentUrl.includes("update-password"),
				`URL bi trebao sadržavati 'update-password', dobijeno: ${currentUrl}`
			);
			const passwordFields = await driver.findElements(
				By.css("input[type='password']")
			);

			assert(
				passwordFields.length >= 2,
				`Trebala bi postojati najmanje 2 polja za lozinku, pronađeno: ${passwordFields.length}`
			);

			console.log(
				`✓ Stranica za promjenu lozinke učitana sa ${passwordFields.length} polja`
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC8_5_promjena_lozinke");
			throw error;
		}
	});
});
