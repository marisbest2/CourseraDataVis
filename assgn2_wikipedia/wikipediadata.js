const fs = require('fs');
const d3 = require('d3');

const articlesArr = require('./data/wikispeedia_paths-and-graph/articles.json').map(({article}) => article)
const linkArr = require('./data/wikispeedia_paths-and-graph/links.json')

module.exports = {
	articlesArr,
	linkArr
}