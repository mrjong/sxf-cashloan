import { buriedPointEvent } from 'utils/Analytins';
import { bug_log } from 'utils/AnalytinsType';

export default function (status, statusText) {
  const logInfo = {
    DC_errorStatus: status,
    DC_errorStatusText: statusText,
    DC_errorUrl: document.URL,
    DC_errorTime: new Date(),
    DC_errorTitle: document.title
  }
  buriedPointEvent(bug_log.api_error_log, logInfo)
}
