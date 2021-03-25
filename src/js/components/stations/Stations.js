import {
  ACTIONS,
  BASE_URL,
  PAGE_TITLE,
  STORAGE,
  SELECTOR,
} from '../../constants.js';
import { getPostOption, request } from '../../utils/api.js';
import { $ } from '../../utils/dom.js';
import { showSnackbar } from '../../utils/snackbar.js';
import { getLocalStorageItem } from '../../utils/storage.js';
import { stationsTemplate, stationTemplate } from './stationsTemplate.js';

class Stations {
  #userAccessToken;
  #stations;
  #props;

  constructor() {
    this.#userAccessToken = null;
    this.#stations = null;
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
      },
    };
  }

  initDOM() {
    // TODO
    // 1. 역 이름 추가 관련 이벤트 등록 <form>
    // 2. 역 수정/삭제 관련 이벤트 등록(위임) <ul>
    // => 역 추가, 역 수정, 역 삭제
    this.$addStationForm = $(SELECTOR.ADD_STATION_FORM);
    this.$stationList = $(SELECTOR.STATION_LIST);
    this._bindEvent();
  }

  async _initStations() {
    try {
      this.#stations = await request(BASE_URL + ACTIONS.STATIONS, {
        headers: {
          Authorization: `Bearer ${this.#userAccessToken}`,
        },
      }).then(res => {
        return res.json();
      });
    } catch (error) {
      alert(
        '지하철 역 목록을 불러오는데 실패했습니다. 관리자에게 문의해주세요 !',
      );
    }
  }

  _bindEvent() {
    this._bindAddStationEvent();
    // this._bindUpdateStationEvent();
  }

  _bindAddStationEvent() {
    console.log('bind');
    this.$addStationForm.addEventListener('submit', e => {
      console.log('add-station');
      e.preventDefault();

      this._handleAddStation(e.target.elements['station-add-input']);
    });
  }

  async _handleAddStation({ value }) {
    try {
      // TODO : 역이름 검증자 필요
      const requestBody = JSON.stringify({
        name: value,
      });
      const option = getPostOption(requestBody, {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${this.#userAccessToken}`,
      });
      const newStation = await request(
        BASE_URL + ACTIONS.STATIONS,
        option,
      ).then(res => {
        return res.json();
      });

      this.$stationList.insertAdjacentHTML(
        'beforeend',
        stationTemplate(newStation),
      );

      // TODO : 아래 상수화
      showSnackbar('역이 추가되었습니다!');
    } catch (error) {
      showSnackbar('역을 추가하는데 실패했습니다. 잠시후 다시 시도해주세요.');
    }
  }
}

export default Stations;
