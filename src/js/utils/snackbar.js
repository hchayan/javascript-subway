import { CLASS_NAME, SELECTOR, SNACK_BAR } from '../constants';

const snackbar = () => {
  let throttle = null;
  const $snackBar = document.querySelector(SELECTOR.SNACK_BAR);

  return text => {
    $snackBar.innerHTML = text;

    if (!throttle) {
      $snackBar.classList.toggle(CLASS_NAME.SHOW);
      throttle = setTimeout(() => {
        throttle = null;
        $snackBar.classList.toggle(CLASS_NAME.SHOW);
      }, SNACK_BAR.VISIBLE_TIME);
    }
  };
};

export const showSnackbar = snackbar();
