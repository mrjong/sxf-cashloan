import { buriedPointEvent } from 'utils/Analytins';
import { bug_log } from 'utils/AnalytinsType';
// import console = require('console');

export default function (status, statusText, config) {
  const logInfo = {
    DC_errorStatus: status,
    DC_errorStatusText: statusText,
    DC_errorUrl: document.URL,
    DC_errorTime: new Date(),
    DC_errorTitle: document.title
  }
  if (config) {
    logInfo.DC_errorApiUrl = config.url
  }
  buriedPointEvent(bug_log.api_error_log, logInfo)
}
