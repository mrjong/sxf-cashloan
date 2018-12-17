import { buriedPointEvent } from 'utils/Analytins';
import { bug_log } from 'utils/AnalytinsType';

export default function(error) {
  const { status, statusText, config } = error
  const logInfo = {
  	status,
  	statusText,
  	url: config.url
  }
   buriedPointEvent(bug_log.api_error_log, logInfo)
}
