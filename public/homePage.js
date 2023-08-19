'use strict';

const logoutButton = new LogoutButton();

logoutButton.action = () => {
	ApiConnector.logout(callback => {
		if (callback.success) {
			console.log(callback.message);
			location.reload()
		} else {
			console.log('ERROR OF LOGOUT');
		};
	});
}

ApiConnector.current(function(responseBody) {
	if (responseBody.success) {
		displayUserProfile(responseBody.data);
	} else {
		console.error("Ошибка при получении текущего пользователя");
	}
});

function displayUserProfile(profileData) {
	ProfileWidget.showProfile(profileData);
}

ApiConnector.parseResponseBody(function(request) {
	if (request.success) {
		getStocks((result) => {
			ratesBoard.clearTable();
			ratesBoard.fillTable(result.data);
		})
	};
});

const ratesBoard = new RatesBoard();

function loadValutes() {
	ratesBoard.clearTable();

	let xhr = new XMLHttpRequest();
	xhr.open("GET", "https://www.cbr-xml-daily.ru/daily_json.js");
	xhr.send();
	xhr.onload = processFinish;

	function processFinish() {
		const responseData = JSON.parse(xhr.responseText);
		const actData = responseData.Valute;

		const usd = actData.USD.Value;
		const eur = actData.EUR.Value;
		const ntc = Number.parseFloat((actData.XDR.Value / 10).toFixed(4));

		const listData = {
			RUB_USD: usd,
			RUB_EUR: eur,
			RUB_NTC: ntc,

			USD_RUB: +(1 / usd).toFixed(5),
			USD_EUR: +(usd / eur).toFixed(5),
			USD_NTC: +(usd / ntc).toFixed(5),

			EUR_RUB: +(1 / eur).toFixed(5),
			EUR_USD: +(eur / usd).toFixed(5),
			EUR_NTC: +(eur / ntc).toFixed(5),

			NTC_RUB: +(1 / ntc).toFixed(5),
			NTC_USD: +(ntc / usd).toFixed(5),
			NTC_EUR: +(ntc / eur).toFixed(5),
		};

		ratesBoard.fillTable(listData);
	}
}

loadValutes();

const interval = setInterval(loadValutes, 60000);

const moneyManager = new MoneyManager();

moneyManager.addMoneyCallback = function(data) {
	ApiConnector.addMoney(data, (responseBody) => {
		if (responseBody.success) {
			displayUserProfile(responseBody.data);
			this.setMessage(true, "Баланс успешно пополнен");
		} else {
			this.setMessage(false, "Ошибка при пополнении баланса");
		}
	});
};

moneyManager.conversionMoneyCallback = function(data) {
	ApiConnector.convertMoney(data, (responseBody) => {
		if (responseBody.success) {
			displayUserProfile(responseBody.data);
			this.setMessage(true, "Конвертация успешно выполнена");
		} else {
			this.setMessage(false, 'Ошибка при конвертации');
		}
	});
};

moneyManager.sendMoneyCallback = function(data) {
	console.log(data);
	ApiConnector.transferMoney(data, (responseBody) => {
		if (responseBody.success) {
			displayUserProfile(responseBody.data);
			this.setMessage(true, "Перевод успешно выполнен");
		} else {
			this.setMessage(false, "Ошибка при переводе: " + responseBody.error);
		}
	});
};


const favoritesWidget = new FavoritesWidget();

ApiConnector.getFavorites((responseBody) => {
	if (responseBody.success) {
		favoritesWidget.clearTable();
		favoritesWidget.fillTable(responseBody.data);
		moneyManager.updateUsersList(responseBody.data);
	} else {
		console.error("Ошибка при получении списка избранного");
	}
});

favoritesWidget.addUserCallback = function(data) {
	ApiConnector.addUserToFavorites(data, (responseBody) => {
		if (responseBody.success) {
			moneyManager.updateUsersList(responseBody.data);
			this.clearTable();
			this.fillTable(responseBody.data);
			this.setMessage(true, "Пользователь успешно добавлен в избранное");
		} else {
			this.setMessage(false, "Ошибка при добавлении:" + responseBody.error);

		}
	});
};

favoritesWidget.removeUserCallback = function(data) {
	ApiConnector.removeUserFromFavorites(data, (responseBody) => {
		if (responseBody.success) {
			moneyManager.updateUsersList(responseBody.data);
			this.clearTable();
			this.fillTable(responseBody.data);
			this.setMessage(true, "Пользователь удален");
		} else {
			this.setMessage(false, "Ошибка при удалении:" + responseBody.error);

		}
	});
}