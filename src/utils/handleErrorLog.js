import { buriedPointEvent } from 'utils/Analytins';
import { bug_log } from 'utils/AnalytinsType';

export default function(error) {
  const { status, statusText, config, url } = error
  const logInfo = {
  	api_log_status:status,
  	api_log_statusText:statusText,
  	api_log_url: config&&config.url || url,
  	api_log_time: new Date()
  }
   buriedPointEvent(bug_log.api_error_log, logInfo)
}
