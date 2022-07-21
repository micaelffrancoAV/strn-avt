module.exports = SlackTestReportNotification;

const fs = require('fs');
const SlackNotify = require('slack-notify');
const path = require('path');

function SlackTestReportNotification(slackUrl) {
  this.slack = SlackNotify(slackUrl);
}

SlackTestReportNotification.protoype.sendReportNotification = function(reportJsonFilePath, gateway) {
    const resolvedPath = path.resolve(__dirname, reportJsonFilePath);

    const jsonString = fs.readFileSync(resolvedPath);
    const reportConfig = JSON.parse(jsonString);

    const alertColor = reportConfig.stats.failures === 0 ? "#2eb886" : "#bd2020";
    const resultMessage = reportConfig.stats.failures === 0 ? "SUCCESS" : "FAILURE";
    const startDate = new Date(reportConfig.stats.start);
    const endDate = new Date(reportConfig.stats.end);

    var duration = new Date(null);
    duration.setSeconds(reportConfig.stats.duration);
    var hhmmssDateFormat = duration.toISOString().substr(11, 8);

    slack.alert({
        attachments: [
            {
                color: alertColor,
                blocks: [
                    {
                        type: "header",
                        text: {
                            type: "plain_text",
                            text: `${gateway.toUpperCase()} Gateway Test results - ${resultMessage}`,
                        }
                    },
                    {
                        type: "section",
                        fields: [
                            {
                                type: "mrkdwn",
                                text: `*Date:*\n${startDate.getDate()}/${startDate.getMonth()}/${startDate.getFullYear()}`
                            },
                            {
                                type: "mrkdwn",
                                text: `*Duration:*\n${hhmmssDateFormat}s`
                            }
                        ]
                    },
                    {
                        type: "section",
                        fields: [
                            {
                                type: "mrkdwn",
                                text: `*Start_time:*\n${startDate.getHours()}:${startDate.getMinutes()}:${startDate.getSeconds()}`
                            },
                            {
                                type: "mrkdwn",
                                text: `*End_time:*\n${endDate.getHours()}:${endDate.getMinutes()}:${endDate.getSeconds()}`
                            }
                        ]
                    }
                ],
            },
            {
                color: alertColor,
                fields: [
                    {   title: 'Total Test count',
                        value: `${reportConfig.stats.tests}/${reportConfig.stats.tests} - ${getPercentage(reportConfig.stats.tests, reportConfig.stats.tests)}%`,
                        short: true
                    },
                    {   title: 'Skipped',
                        value: `${reportConfig.stats.skipped}/${reportConfig.stats.tests} - ${getPercentage(reportConfig.stats.skipped, reportConfig.stats.tests)}%`,
                        short: true
                    },
                    {   title: 'Passes',
                        value: `${reportConfig.stats.passes}/${reportConfig.stats.tests} - ${getPercentage(reportConfig.stats.passes, reportConfig.stats.tests)}%`,
                        short: true
                    },
                    {   title: 'Failures',
                        value: `${reportConfig.stats.failures}/${reportConfig.stats.tests} - ${getPercentage(reportConfig.stats.failures, reportConfig.stats.tests)}%`,
                        short: true
                    }
                ],
            }
        ]
    });
}

function getPercentage(target, total){
    return (target * 100) / total;
}

