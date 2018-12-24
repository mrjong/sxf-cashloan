import { buriedPointEvent } from 'utils/Analytins';
import { bug_log } from 'utils/AnalytinsType';

export default function(status, statusText, url) {
  // const { status, statusText, config, url } = error
  const logInfo = {
  	DC_errorStatus:status,
  	DC_errorStatusText:statusText,
  	DC_errorUrl: url,
    DC_errorTime: new Date(),
    DC_errorTitle: document.title
  }
   buriedPointEvent(bug_log.api_error_log, logInfo)
}
