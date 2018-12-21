import { buriedPointEvent } from 'utils/Analytins';
import { bug_log } from 'utils/AnalytinsType';

export default function(status, statusText, url) {
  // const { status, statusText, config, url } = error
  const logInfo = {
  	api_log_status:status,
  	api_log_statusText:statusText,
  	api_log_url: url,
    api_log_time: new Date(),
    pageTitle: document.title
  }
   buriedPointEvent(bug_log.api_error_log, logInfo)
}
