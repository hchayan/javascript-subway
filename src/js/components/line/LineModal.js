import { lineAPI } from '../../../../api/line';
import { SELECTOR, SUCCESS_MESSAGE } from '../../constants';
import { $, clearForm, getFormData } from '../../utils/dom';
import {
  bindModalCloseEvent,
  onModalClose,
  onModalShow,
} from '../../utils/modal';
import { showSnackbar } from '../../utils/snackbar';
import { lineTemplate } from './lineTemplate';
import { checkLineValid } from './lineValidator';

class LineModal {
  #userAccessToken;
  #state;

  constructor({ updateLines }) {
    this.updateLines = updateLines;
  }

  init(userAccessToken) {
    this.#userAccessToken = userAccessToken;
    this.initDOM();
  }

  initDOM() {
    this.$lineForm = $(SELECTOR.LINE_FORM);
    this.$lineList = $(SELECTOR.LINE_LIST);
    this.bindEvent();
  }

  bindEvent() {
    bindModalCloseEvent();
    this.bindLineFormEvent();
    this.bindSelectColorEvent();
  }

  bindLineFormEvent() {
    this.$lineForm.addEventListener('submit', e => {
      if (this.#state === 'add') {
        this._handleAddLineClose(e);
      }

      if (this.#state === 'modify') {
        this._handleModifyLineClose(e);
      }
    });
  }

  bindSelectColorEvent() {
    $('.subway-line-color-selector').addEventListener('click', e => {
      if (!e.target.classList.contains('color-option')) return;
      this._handleSelectColor(e);
    });
  }

  handleLineOpen({ state }) {
    onModalShow();
    this.#state = state;
  }

  async _handleAddLineClose(e) {
    e.preventDefault();
    const lineInfo = getFormData(e.target.elements);
    const message = checkLineValid(lineInfo);
    if (message) {
      alert(message);
      return;
    }

    try {
      const { id, name, color } = await lineAPI.addLine({
        userAccessToken: this.#userAccessToken,
        lineInfo,
      });

      this.updateLines(id, { name, color });
      this.$lineList.insertAdjacentHTML(
        'beforeend',
        lineTemplate(id, { name, color }),
      );

      clearForm(this.$lineForm);
      showSnackbar(SUCCESS_MESSAGE.ADD_LINE);
      onModalClose();
    } catch (res) {
      const message = await res.text();
      showSnackbar(message);
    }
  }

  // _handleModifyLineClose(e) {
  //   e.preventDefault();
  // }

  _handleSelectColor(e) {
    $('#subway-line-color').value = e.target.dataset.color;
  }
}

export default LineModal;
