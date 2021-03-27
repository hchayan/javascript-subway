import { checkLoginValid } from './loginValidator.js';
import { loginTemplate } from './loginTemplate.js';
import { $, getFormData } from '../../utils/dom.js';
import { request, getPostOption } from '../../utils/api.js';
import { setLocalStorageItem } from '../../utils/storage.js';
import {
  BASE_URL,
  ACTIONS,
  SNACKBAR_MESSAGE,
  PATH,
  SELECTOR,
  CLASS_NAME,
  ERROR_MESSAGE,
  PAGE_TITLE,
  LOGIN_ERROR,
  STORAGE,
} from '../../constants.js';

class Login {
  #props;

  constructor(props) {
    this.#props = props;
  }

  init() {}

  getPageInfo() {
    return {
      title: PAGE_TITLE.LOGIN,
      contents: {
        main: loginTemplate(),
      },
    };
  }

  initDOM() {
    this._selectDOM();
    this._bindEvent();
  }

  _selectDOM() {
    this.$loginForm = $(SELECTOR.LOGIN_FORM);
  }

  _bindEvent() {
    this._bindSignUpEvent();
    this._bindLoginEvent();
  }

  _bindSignUpEvent() {
    this.$loginForm.addEventListener('click', e => {
      if (!e.target.classList.contains(CLASS_NAME.SIGNUP_LINK)) return;
      e.preventDefault();
      this.#props.switchURL(PATH.SIGNUP);
    });
  }

  _bindLoginEvent() {
    this.$loginForm.addEventListener('submit', e => {
      this._handleLogin(e);
    });
  }

  _handleLogin(e) {
    e.preventDefault();

    const formData = getFormData(e.target.elements);

    const errorMessage = checkLoginValid(formData);
    if (errorMessage) {
      alert(errorMessage);
      return;
    }

    this._requestLogin(formData);
  }

  async _requestLogin(data) {
    try {
      const requestBody = JSON.stringify({
        email: data.email,
        password: data.password,
      });
      const option = getPostOption(requestBody);
      const { accessToken } = await request(
        BASE_URL + ACTIONS.LOGIN,
        option,
      ).then(res => {
        return res.json();
      });

      setLocalStorageItem(STORAGE.USER_ACCESS_TOKEN, accessToken);

      this.#props.switchURL(PATH.HOME);
      this.#props.showSnackbar(SNACKBAR_MESSAGE.LOGIN);
    } catch (error) {
      alert(LOGIN_ERROR[error] || ERROR_MESSAGE.LOGIN_FAILED);
    }
  }
}

export default Login;
