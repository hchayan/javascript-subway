import { homeTemplate } from './homeTemplate.js';

class Home {
  constructor() {
    this.isLoggedIn = false;
  }

  init({ isLoggedIn }) {
    this.isLoggedIn = isLoggedIn;
  }

  getInfo() {
    return {
      title: '🚇 지하철 APP',
      contents: {
        main: homeTemplate(this.isLoggedIn),
      },
    };
  }

  initDOM() {
    // setlectDOM, bindEVENT
  }
}

export default Home;
