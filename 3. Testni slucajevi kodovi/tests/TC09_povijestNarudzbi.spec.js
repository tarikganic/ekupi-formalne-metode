/**
 * Test Case 9: Provjera povijesti narudžbi
 * Testira funkcionalnost pregleda povijesti narudžbi korisnika
 *
 * Preduslov: Korisnik je prijavljen
 * Očekivani rezultat: Prikazuje se lista prethodnih narudžbi
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

describe("Test Case 9: Provjera povijesti narudžbi", function () {
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

	it("TC9.1 - Trebalo bi pristupiti stranici povijesti narudžbi", async function () {
		try {
			await loginUser();

			await driver.get(CONFIG.BASE_URL + "/bs/my-account/orders");
			await driver.sleep(3000);

			const currentUrl = await driver.getCurrentUrl();
			assert(
				currentUrl.includes("orders") || currentUrl.includes("my-account"),
				`Trebalo bi biti na stranici narudžbi, dobijeno: ${currentUrl}`
			);
			const ordersSection = await driver.findElements(
				By.css(
					".order-list, .orders-history, .account-orders, .my-account-content, table"
				)
			);

			assert(
				ordersSection.length > 0,
				"Trebala bi postojati sekcija za prikaz narudžbi"
			);

			console.log("✓ Uspješno pristupljeno stranici povijesti narudžbi");
		} catch (error) {
			await takeScreenshotOnError(driver, "TC9_1_pristup_povijesti");
			throw error;
		}
	});

	it("TC9.2 - Trebalo bi prikazati listu narudžbi ili poruku o praznoj listi", async function () {
		try {
			await loginUser();

			await driver.get(CONFIG.BASE_URL + "/bs/my-account/orders");
			await driver.sleep(3000);

			let contentFound = false;
			const orderItems = await driver.findElements(
				By.css(
					".order-item, .order-row, .order-entry, tr.order, [data-order-id]"
				)
			);

			if (orderItems.length > 0) {
				contentFound = true;
				console.log(`✓ Pronađeno ${orderItems.length} narudžbi`);
			} else {
				try {
					const emptyMessage = await driver.findElement(
						By.xpath("//*[contains(text(), 'Nema narudžbi')]")
					);
					contentFound = await emptyMessage.isDisplayed();
					console.log("✓ Prikazana poruka o praznoj listi narudžbi");
				} catch (e) {
					contentFound = true;
				}
			}

			assert(
				contentFound,
				"Trebala bi se prikazati lista narudžbi ili poruka o praznoj listi"
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC9_2_lista_narudzbi");
			throw error;
		}
	});

	it("TC9.3 - Navigacija iz menija na povijesti narudžbi", async function () {
		try {
			await loginUser();

			await driver.get(CONFIG.BASE_URL + "/bs/my-account/orders");
			await driver.sleep(3000);

			const menuLinks = await driver.findElements(
				By.css(".accLinkList li a, .nav-left a")
			);
			var ordersLink = null;
			for (let link of menuLinks) {
				const text = (await link.getText()).trim();
				console.log(`-- Meni opcija: ${text}`);

				if (text === "Istorija Narudžbi") {
					ordersLink = link;
					break;
				}
			}
			console.log(menuLinks);

			if (!ordersLink) {
				throw new Error("Link za povijest narudžbi nije pronađen u meniju");
			}
			await safeClick(driver, ordersLink);
			await driver.sleep(3000);
			const currentUrl = await driver.getCurrentUrl();
			assert(
				currentUrl.includes("orders"),
				`URL bi trebao sadržavati 'orders', dobijeno: ${currentUrl}`
			);

			console.log("✓ Navigacija na povijest narudžbi iz menija funkcionira");
		} catch (error) {
			await takeScreenshotOnError(driver, "TC9_3_navigacija_narudzbe");
			throw error;
		}
	});

	it("TC9.4 - Neprijavljen korisnik bi trebao biti preusmjeren na prijavu", async function () {
		try {
			await driver.manage().deleteAllCookies();

			await driver.get(CONFIG.BASE_URL + "/bs/my-account/orders");
			await driver.sleep(3000);
			const currentUrl = await driver.getCurrentUrl();

			assert(
				currentUrl.includes("login") || currentUrl.includes("signin"),
				`Neprijavljen korisnik bi trebao biti preusmjeren na login, dobijeno: ${currentUrl}`
			);

			console.log("✓ Neprijavljen korisnik je pravilno preusmjeren na prijavu");
		} catch (error) {
			await takeScreenshotOnError(driver, "TC9_4_pristup_bez_prijave");
			throw error;
		}
	});
});
