const { context } = require('@actions/github');
const core = require('@actions/core');

function buildSlackAttachments({ status, color, github, message, mention }) {
  const { payload, ref, workflow, eventName, actor } = github.context;
  const { owner, repo } = context.repo;
  const event = eventName;
  const branch = event === 'pull_request' ? payload.pull_request.head.ref : ref.replace('refs/heads/', '');

  const sha = event === 'pull_request' ? payload.pull_request.head.sha : github.context.sha;

  const referenceLink =
    event === 'pull_request'
      ? {
          title: 'Pull Request',
          value: `<${payload.pull_request.html_url} | ${payload.pull_request.title}>`,
          short: true,
        }
      : {
          title: 'Branch',
          value: `<https://github.com/${owner}/${repo}/commit/${sha} | ${branch}>`,
          short: true,
        };

  var fields = [
    {
      title: 'Action',
      value: `<https://github.com/${owner}/${repo}/commit/${sha}/checks | ${workflow}>`,
      short: true,
    },
    {
      title: 'Status',
      value: status,
      short: true,
    },
    referenceLink,
    {
      title: 'Event',
      value: event,
      short: true,
    },
    {
      title: 'Author',
      value: actor,
      short: true,
    },
  ]

  if (message) {
    if (mention) {
      const mapping = JSON.parse(process.env.author_mapping);

      fields.push(
        {
          value: `<@${mapping[actor]}> ${message}`,
          short: false
        }
      );
    } else {
      fields.push(
        {
          value: message,
          short: false,
        }
      );
    }
  }

  return [
    {
      color,
      fields: fields,
      footer_icon: 'https://github.githubassets.com/favicon.ico',
      footer: `<https://github.com/${owner}/${repo} | ${owner}/${repo}>`,
      ts: Math.floor(Date.now() / 1000),
    },
  ];
}

module.exports.buildSlackAttachments = buildSlackAttachments;

function formatChannelName(channel) {
  return channel.replace(/[#@]/g, '');
}

module.exports.formatChannelName = formatChannelName;
