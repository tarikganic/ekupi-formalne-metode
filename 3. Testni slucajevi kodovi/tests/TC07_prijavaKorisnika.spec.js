/**
 * Test Case 7: Prijava korisnika
 * Testira funkcionalnost prijave korisnika na eKupi.ba
 *
 * Preduslov: Korisnik ima validan nalog
 * Očekivani rezultat: Korisnik je uspješno prijavljen
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
	login,
	isLoggedIn,
	By,
	until,
} = require("../helpers/testSetup");

describe("Test Case 7: Prijava korisnika", function () {
	this.timeout(CONFIG.TIMEOUTS.DEFAULT);

	let driver;

	before(async function () {
		driver = await initDriver();
	});

	after(async function () {
		await closeDriver(driver);
	});

	it("TC7.1 - Trebalo bi uspješno prijaviti korisnika sa validnim kredencijalima", async function () {
		try {
			await driver.get(CONFIG.LOGIN_URL);
			await driver.sleep(3000);

			await acceptCookies(driver);

			const emailInput = await waitForElement(
				driver,
				By.css(
					"input[name='j_username'], input[type='email'], #j_username, input[name='email']"
				)
			);
			await clearAndType(driver, emailInput, CONFIG.CREDENTIALS.email);
			await driver.sleep(500);

			const passwordInput = await waitForElement(
				driver,
				By.css(
					"input[name='j_password'], input[type='password'], #j_password, input[name='password']"
				)
			);
			await clearAndType(driver, passwordInput, CONFIG.CREDENTIALS.password);
			await driver.sleep(500);

			const loginButton = await waitForElement(
				driver,
				By.css("button#submit.btn.btn-primary")
			);
			await safeClick(driver, loginButton);

			await driver.sleep(5000);

			let loginSuccessful = false;

			const currentUrl = await driver.getCurrentUrl();
			const notOnLoginPage = !currentUrl.includes("login");
			try {
				const userElement = await driver.wait(
					until.elementLocated(
						By.css(
							".my-account, .user-name, .logged-in, [data-user-logged], .account-navigation, " +
								"a[href*='my-account'], a[href*='logout'], .user-info"
						)
					),
					10000
				);
				loginSuccessful = await userElement.isDisplayed();
			} catch (e) {
				console.log(
					"Element koji indicira prijavljenog korisnika nije pronađen."
				);
			}
			if (!loginSuccessful && notOnLoginPage) {
				const errorMessages = await driver.findElements(
					By.css(".error-message, .alert-error, .login-error")
				);
				let hasError = false;
				for (const error of errorMessages) {
					if (await error.isDisplayed()) {
						hasError = true;
						break;
					}
				}
				loginSuccessful = !hasError && notOnLoginPage;
			}

			assert(loginSuccessful, "Korisnik bi trebao biti uspješno prijavljen");

			console.log(
				`✓ Korisnik "${CONFIG.CREDENTIALS.email}" uspješno prijavljen`
			);
		} catch (error) {
			await takeScreenshotOnError(driver, "TC7_1_prijava_korisnika");
			throw error;
		}
	});

	it("TC7.2 - Trebalo bi prikazati grešku za nevažeće kredencijale", async function () {
		try {
			await driver.get(CONFIG.LOGIN_URL);
			await driver.sleep(2000);

			const emailInput = await waitForElement(
				driver,
				By.css("input[name='j_username'], input[type='email'], #j_username")
			);
			await clearAndType(driver, emailInput, "nevazeci@email.com");

			const passwordInput = await waitForElement(
				driver,
				By.css("input[name='j_password'], input[type='password'], #j_password")
			);
			await clearAndType(driver, passwordInput, "pogresnaLozinka123");

			const loginButton = await waitForElement(
				driver,
				By.css("button#submit.btn.btn-primary")
			);
			await safeClick(driver, loginButton);
			await driver.sleep(3000);

			let errorFound = false;
			try {
				const errorMessage = await driver.wait(
					until.elementLocated(
						By.css(
							".error-message, .alert-error, .login-error, .alert-danger, " +
								"[class*='error'], [class*='invalid']"
						)
					),
					5000
				);
				errorFound = await errorMessage.isDisplayed();
			} catch (e) {
				const currentUrl = await driver.getCurrentUrl();
				errorFound = currentUrl.includes("login");
			}

			const loggedIn = await isLoggedIn(driver);

			assert(
				errorFound || !loggedIn,
				"Trebala bi se prikazati poruka o grešci za nevažeće kredencijale"
			);

			console.log("✓ Prikazana poruka o grešci za nevažeće kredencijale");
		} catch (error) {
			await takeScreenshotOnError(driver, "TC7_2_nevazeci_kredencijali");
			throw error;
		}
	});

	it("TC7.3 - Trebalo bi prikazati grešku za prazan email", async function () {
		try {
			await driver.get(CONFIG.LOGIN_URL);
			await driver.sleep(2000);

			const passwordInput = await waitForElement(
				driver,
				By.css("input[name='j_password'], input[type='password'], #j_password")
			);
			await clearAndType(driver, passwordInput, "nekaLozinka123");

			const loginButton = await waitForElement(
				driver,
				By.css("button#submit.btn.btn-primary")
			);
			await safeClick(driver, loginButton);
			await driver.sleep(2000);

			const currentUrl = await driver.getCurrentUrl();
			const stillOnLogin = currentUrl.includes("login");
			const emailInput = await driver.findElement(
				By.css("input[name='j_username'], input[type='email'], #j_username")
			);
			const validationMessage = await emailInput.getAttribute(
				"validationMessage"
			);
			const isRequired = await emailInput.getAttribute("required");

			assert(
				stillOnLogin || validationMessage || isRequired,
				"Trebala bi se prikazati validacija za prazan email"
			);

			console.log("✓ Validacija za prazan email funkcionira");
		} catch (error) {
			await takeScreenshotOnError(driver, "TC7_3_prazan_email");
			throw error;
		}
	});

	it("TC7.4 - Trebalo bi prikazati grešku za praznu lozinku", async function () {
		try {
			await driver.get(CONFIG.LOGIN_URL);
			await driver.sleep(2000);

			const emailInput = await waitForElement(
				driver,
				By.css("input[name='j_username'], input[type='email'], #j_username")
			);
			await clearAndType(driver, emailInput, "test@email.com");

			const loginButton = await waitForElement(
				driver,
				By.css("button#submit.btn.btn-primary")
			);
			await safeClick(driver, loginButton);
			await driver.sleep(2000);

			const currentUrl = await driver.getCurrentUrl();
			const stillOnLogin = currentUrl.includes("login");
			const passwordInput = await driver.findElement(
				By.css("input[name='j_password'], input[type='password'], #j_password")
			);
			const validationMessage = await passwordInput.getAttribute(
				"validationMessage"
			);
			const isRequired = await passwordInput.getAttribute("required");

			assert(
				stillOnLogin || validationMessage || isRequired,
				"Trebala bi se prikazati validacija za praznu lozinku"
			);

			console.log("✓ Validacija za praznu lozinku funkcionira");
		} catch (error) {
			await takeScreenshotOnError(driver, "TC7_4_prazna_lozinka");
			throw error;
		}
	});
});
