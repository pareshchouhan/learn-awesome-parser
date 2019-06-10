const markdownJson = require('markdown-json');
const _ = require('lodash');
const fs = require('fs');
const settings = {
        name: 'markdown-json',
      	cwd: './',
      	src: './',
        filePattern: 'learn-awesome/*.md',
        ignore: "*(icon|input)*",
        dist: './output.json',
        server: false,
        port: 3001
};

const settings2 = {
	name: 'markdown-json',
	cwd: './',
	src: './learn-awesome/',
	filePattern: '**/*.md',
	ignore: "*(icon|input)*",
	dist: './output.json',
	server: false,
	port: 3001
};
var himalya = require('himalaya');

markdownJson(settings).then((data) => {
	const processedData = processMDFiles(data);
	fs.writeFile('temp1.json', JSON.stringify(processedData));
	// console.log(subjects);
}).catch( err => {
	console.log('error: ', err);
});

markdownJson(settings2).then((data) => {
	const processedData = processMDFiles(data);
	fs.writeFile('temp2.json', JSON.stringify(processedData));
	// console.log(subjects);
}).catch( err => {
	console.log('error: ', err);
});

function processMDFiles(data) {
	const subjects = {};
	for (let item of Object.keys(data)) {
		const json = himalya.parse(data[item].contents.replace('\n', ''));
		const removedN =_.filter(json, obj => obj.content !== '\n');
		// console.log(removedN);
		// console.log('data:', data[item].contents.replace('\n', ''));
		const removedNFromChild = _.filter(removedN[1].children, obj => obj.content !== '\n');
		subjects[item] = {
		};
		try {
			// console.log(getTitleAndMeta(removedN[0], removedN[1]));
			for (let i = 2; i < removedN.length; i++) {
				switch(removedN[i].tagName) {
					case 'h2':
						const nodeTitle = getTitleFromH2(removedN[i]);
						subjects[item][nodeTitle] = {
								title: nodeTitle,
						};
						let nodeData = [];
						if (removedN[i + 1] && removedN[i + 1].tagName === 'ul') {
							i++;
							nodeData = getArrayLinksFromUL(removedN[i]);
							subjects[item][nodeTitle].links = nodeData;
						}
						break;
					default:
							removedN[i].tagName !== 'hr' ? console.log('Element not registered', removedN[i].tagName, ' in file ', item) : '';
				}
			}
		} catch(exc) {
			console.log('Failed for Item', item);
		}
	}
	return subjects;
}

function getTitleFromH2(node) {
	const filteredNode = filterN(node.children);
	// console.log(filteredNode[0].content);
	return filteredNode[0].content;
}

function getArrayLinksFromUL(node) {
	const filteredNode = filterN(node.children);
	const Links = [];
	for (let filtNode in filteredNode) {
		const AElements = filteredNode[filtNode].children;
		const filteredAElements = filterN(AElements);
		const source = filteredAElements[1] && filteredAElements[1].content || '';
		const link = filteredAElements[0] && filteredAElements[0].attributes[0] && filteredAElements[0].attributes[0].value || '';
		const sourceText = filteredAElements[0] && filteredAElements[0].children[0] && filteredAElements[0].children[0].content || '';
		Links.push({
			title: source,
			link: link,
			sourceText: sourceText
		});
	}
	return Links;
}

function getTitleAndMeta(titleNode, metaNode) {
	// const filteredTitleNode = filterN(titleNode);
	const filteredMetaNode = filterN(metaNode.children);
	// console.log(metaNode);
	// console.log(filteredMetaNode);
	const data = {
		title: titleNode.children[0].content,
	};
	for (let filtNode in filteredMetaNode) {
		const splitItem = filteredMetaNode[filtNode].children[0].content.split(':');
		data[splitItem[0]] = splitItem[1];
	}
	return data;
};

function filterN(node) {
	return _.filter(node, obj => obj.content !== '\n');
}