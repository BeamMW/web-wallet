import {
  Login, Restore, Create, SetPassword, Progress,
} from '@pages/intro';
import { Portfolio, SendConfirm, SendForm } from '@pages/main';
import { View } from '@app/model';

const ROUTES = {
  [View.LOGIN]: Login,
  [View.RESTORE]: Restore,
  [View.CREATE]: Create,
  [View.SET_PASSWORD]: SetPassword,
  [View.PROGRESS]: Progress,
  [View.PORTFOLIO]: Portfolio,
  [View.SEND_FORM]: SendForm,
  [View.SEND_CONFIRM]: SendConfirm,
};

export default ROUTES;
