import {
  ACTIONS,
  BASE_URL,
  PAGE_TITLE,
  STORAGE,
  SELECTOR,
  STATION_ERROR,
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
  FORM,
  CONFIRM_MESSAGE,
  REQUEST_METHOD,
} from '../../constants.js';
import { request } from '../../utils/api.js';
import { $, clearForm } from '../../utils/dom.js';

import { showSnackbar } from '../../utils/snackbar.js';
import { getLocalStorageItem } from '../../utils/storage.js';
import StationModal from './stationModal.js';
import {
  modalTemplate,
  stationsTemplate,
  stationTemplate,
} from './stationTemplate.js';
import { checkStationValid } from './stationValidator.js';

class Station {
  #userAccessToken;
  #stations;
  #modal;

  constructor() {
    this.#userAccessToken = null;
    this.#stations = {};
    this.#modal = new StationModal();
  }

  async init() {
    this.#userAccessToken = getLocalStorageItem(STORAGE.USER_ACCESS_TOKEN);
    await this._initStations();
  }

  getPageInfo() {
    return {
      title: PAGE_TITLE.STATIONS,
      contents: {
        main: stationsTemplate(this.#stations),
        modal: modalTemplate(),
      },
    };
  }

  initDOM() {
    // TODO
    // 2. 역 수정/삭제 관련 이벤트 등록(위임) <ul>
    // => 역 추가, 역 수정, 역 삭제
    this.$addStationForm = $(SELECTOR.ADD_STATION_FORM);
    this.$stationList = $(SELECTOR.STATION_LIST);
    this.#modal.init(this.#userAccessToken);
    this._bindEvent();
  }

  async _initStations() {
    try {
      const option = {
        Authorization: `Bearer ${this.#userAccessToken}`,
      };
      const requestedStation = await request(
        `${BASE_URL}${ACTIONS.STATIONS}`,
        option,
      ).then(res => {
        return res.json();
      });

      requestedStation.forEach(({ id, ...rest }) => {
        this.#stations[id] = rest;
      });
    } catch {
      alert(ERROR_MESSAGE.LOAD_STATION_FAILED);
    }
  }

  _bindEvent() {
    this._bindAddStationEvent();
    this._bindUpdateStationEvent();
  }

  _bindAddStationEvent() {
    this.$addStationForm.addEventListener('submit', e => {
      this._handleAddStation(e);
    });
  }

  _bindUpdateStationEvent() {
    this.$stationList.addEventListener('click', e => {
      if (e.target.classList.contains('modify-button')) {
        this.#modal.handleModifyStationOpen(this._getSelectedStationInfo(e));
        return;
      }

      if (e.target.classList.contains('delete-button')) {
        this._handleRemoveStation(e);
        return;
      }
    });
  }

  async _handleAddStation(e) {
    e.preventDefault();

    const name = e.target.elements[FORM.STATION.ADD_INPUT].value;
    const message = checkStationValid(name);
    if (message) {
      alert(message);
      return;
    }

    try {
      // TODO: option, newStation fetch 과정 분리할수 있으면 분리하기
      const option = {
        method: REQUEST_METHOD.POST,
        Authorization: `Bearer ${this.#userAccessToken}`,
        body: {
          name,
        },
      };

      const newStation = await request(
        `${BASE_URL}${ACTIONS.STATIONS}`,
        option,
      ).then(res => {
        return res.json();
      });

      this.$stationList.insertAdjacentHTML(
        'beforeend',
        stationTemplate(newStation),
      );

      clearForm(this.$addStationForm);
      showSnackbar(SUCCESS_MESSAGE.ADD_STATION);
    } catch ({ status }) {
      showSnackbar(STATION_ERROR[status] || ERROR_MESSAGE.ADD_STATION_FAILED);
    }
  }

  // async _handleModifyStationOpen(e) {

  //   onModalShow();
  //   const stationItem = e.target.closest('[data-station-id]');
  //   $('#station-modify-input').value = this.#stations[
  //     stationItem.dataset.stationId
  //   ].name;

  //   $('#station-modify-input').focus();
  // }

  // async _handleModifyStation(e) {

  //   // 모달 열기 + input값 초기화

  //   this.modal._handleModifyStation(e, this.#stations)
  //   onModalClose()
  //   // proccess 처리
  // }

  async _handleRemoveStation(e) {
    if (!confirm(CONFIRM_MESSAGE.REMOVE)) return;

    try {
      const option = {
        method: REQUEST_METHOD.DELETE,
        Authorization: `Bearer ${this.#userAccessToken}`,
      };

      const { $stationItem, id } = this._getSelectedStationInfo(e);

      await request(`${BASE_URL}${ACTIONS.STATIONS}/${id}`, option);

      $stationItem.remove();
      showSnackbar(SUCCESS_MESSAGE.REMOVE_STATION);
    } catch (error) {
      showSnackbar(ERROR_MESSAGE.REMOVE_STATION_FAILED);
    }
  }

  _getSelectedStationInfo({ target }) {
    const $stationItem = target.closest('[data-station-id]');
    const id = $stationItem.dataset.stationId;
    const name = this.#stations[id].name;

    return { $stationItem, id, name };
  }
}

export default Station;
