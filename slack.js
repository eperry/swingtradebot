// slack webhook

const config = require('config.json');
const request = require('request');

function slack(payload) {
	let body = {
		'username': 'gdax_bot',
		'icon_emoji': ':robot_face:',
		'response_type': 'in_channel',
		'channel_name': '@jon',			// replace
		'text': payload
	}

	const options = {
		method: 'POST',
		url: config['SLACK_URL'],
		headers: {
			'content-type': 'application/json'
		},
		body,
		json: true
	}
	request(options, (error, response, body) => {
		if (error) {
			console.log(error);
		} else {
			console.log('Payload delivered');
			console.log(body);
		}
	});
};

module.exports = slack;
