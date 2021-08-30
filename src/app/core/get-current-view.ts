import {
  Login, Restore, Create, SetPassword, Progress,
} from '@pages/intro';
import { Portfolio, Send } from '@pages/main';
import { View } from '@state/shared';

const ROUTES = {
  [View.LOGIN]: Login,
  [View.RESTORE]: Restore,
  [View.CREATE]: Create,
  [View.SET_PASSWORD]: SetPassword,
  [View.PROGRESS]: Progress,
  [View.PORTFOLIO]: Portfolio,
  [View.SEND]: Send,
};

const getCurrentView = (view: View) => ROUTES[view];

export default getCurrentView;
