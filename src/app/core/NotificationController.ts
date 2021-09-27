import { Notification } from './types';

let NotificationData;

export default class NotificationController {
  static setNotification(data: Notification) {
    NotificationData = data;
  }

  static getNotification():Notification {
    return NotificationData;
  }
}
