const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const config = require(path.join(__dirname, '../', 'config.json'));

module.exports = {
	getPageContext
}
function getCommonData()  {
	let result = {};
	if (config.commonData) {
		_.forEach(config.commonData, name => {
			let d = JSON.parse(fs.readFileSync(path.join(__dirname, '../datasource', `${name}.json`)));
			result[name] = d
		});
	}

	return result
}

function getPageContext (page, isExport) {
	let layout = page.layout || config.defaultLayout;

	if (config.contentOnly) {
		layout = config.emptyLayout
	}
	console.log('layout')

	const options = {
		root: config.buildStatic,
	 	_pages: config.pages,
	 	_showPages: config.showPageList,
		_env: process.env.NODE_ENV,
	 	common: getCommonData(),
	 	isExport: isExport,
	 	locals: {},
	 	storage: config.storage,
	 	themeColor: config.themeColor,
	 	layout
	}

	if (page.pageData) {
	 	_.forEach(page.pageData,  (v, k) => {
	 		let d = JSON.parse(fs.readFileSync(path.join(__dirname, '../datasource', `${v}.json`)));
	 		options[v] = d
	 	});
	}

	if (page.pageVars) {
	 	_.forEach(page.pageVars, (v, k) => {
	 		options.locals[k] = v
	 	});
	}
	
	return {
		options
	}
}