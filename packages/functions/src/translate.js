const axios = require('axios');
import handler from "@TipLine/core/handler";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const encodedParams = new URLSearchParams();

  encodedParams.set('text', data.text);
  encodedParams.set('to', data.lang);

const options = {
  method: 'POST',
  url: 'https://nlp-translation.p.rapidapi.com/v1/translate',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'X-RapidAPI-Key': 'bf6fba6474msh3891b1b2e3c4785p1077f0jsn07a81754ba14',
    'X-RapidAPI-Host': 'nlp-translation.p.rapidapi.com'
  },
  data: encodedParams,
};

try {
	const response = await axios.request(options);

  return response.data.translated_text[data.lang];
} catch (error) {
	console.error(error);
}
});