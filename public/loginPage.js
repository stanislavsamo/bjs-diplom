'use strict';

const userForm = new UserForm();


userForm.loginFormCallback = async (formData) => {
	try {
		const response = await ApiConnector.login(formData, (responseData) => {
			if (responseData.success) {
				console.log('Login successful');
				userForm.setLoginErrorMessage('Вы успешно вошли в систему!');
				setTimeout(() => {
					location.reload()
				}, 2000);
			} else {
				userForm.setLoginErrorMessage('Неверный логин / пароль');
			}
		});
	} catch (error) {
		console.error('Error while logging in:', error);
		this.setLoginErrorMessage('Проблемы с передачей данных');
	}
};

userForm.registerFormCallback = (formData) => {
	try {
		const response = ApiConnector.register(formData, (responseData) => {
			if (responseData.success) {
				alert('Регистрация прошла упешно');
				setTimeout(() => {
					location.reload();
				}, 2000);
			} else {
				userForm.setRegisterErrorMessage(`Пользователь с логином ${formData.login} уже зарегестрирован`);
			}
		});
	} catch (error) {
		console.error("An error occurred:", error);
	}
};