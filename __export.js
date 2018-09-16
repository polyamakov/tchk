'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const config = require(path.join(__dirname, 'config.json'));
const compileDir = path.join(__dirname, 'html');
const templateDir = path.join(__dirname, 'views');
const nunjucks = require('nunjucks');
const del = require('del');
const env = nunjucks.configure('views', {
    autoescape: false,
});
const generate = require('nanoid/generate');

let filters = require('./filters/filters');
let commonData = {};
const { getPageContext } = require('./workers/pages.js')

filters.hash = generate('1234567890abcdef', 10);
filters.export = true;

_.each(filters, (func, name) => {
  if (name !== 'export') {
    env.addFilter(name, func);
  }
});

if (!fs.existsSync(compileDir)) {
	fs.mkdirSync(compileDir);
}

(() => {
	// clean folder
	del.sync([`${compileDir}/*.html`]);

	_.forEach(config.pages, page => {
		const {options} = getPageContext(page, true);

		const template = fs.readFileSync(path.join(templateDir, `${page.name}.html`));
		const res = nunjucks.render(path.join(templateDir, `${page.name}.html`), options);
		fs.writeFileSync(path.join(compileDir, `${page.name}.html`), res);
	});

	// compile default layout

	if (config.contentOnly) {
		const context = {
			root: config.buildStatic,
		 	isExport: true,
			_env: process.env.NODE_ENV,
		 	storage: config.storage
		}

		const template = fs.readFileSync(path.join(templateDir, config.defaultLayout));
		const result = nunjucks.render(path.join(templateDir, config.defaultLayout), context);
		fs.writeFileSync(path.join(compileDir, config.defaultLayout), result);
	}
})();
