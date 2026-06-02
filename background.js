// background.js为选中网页内容右键点击插件所添加的功能
// chrome.runtime.onInstalled.addListener(function () {
//为网页右键按钮添加属性
var contextMenuItem2 = {
    id: 'speak',
    title: 'Speak',
    contexts: ["selection"]
};
chrome.contextMenus.create(contextMenuItem2);

chrome.contextMenus.onClicked.addListener(function (clickData) {
    if (clickData.menuItemId == "speak" && clickData.selectionText) {
        // 朗读器
        chrome.tts.speak(clickData.selectionText, { 'rate': 0.7 });
    }
});
// });
chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: 'search',
        title: '我的搜索',
        type: 'normal',
        contexts: ['selection'],
    });
    chrome.contextMenus.create({
        id: 'bilibili',
        title: '使用bilibili搜索"%s"',
        type: 'normal',
        contexts: ['selection'],
        parentId: 'search',
    });
    // chrome.contextMenus.create({
    //     id: 'baidu',
    //     title: '使用百度搜索"%s"',
    //     type: 'normal',
    //     contexts: ['selection'],
    //     parentId: 'search',
    // });
    chrome.contextMenus.create({
        id: 'baidubaike',
        title: '使用百度百科搜索"%s"',
        type: 'normal',
        contexts: ['selection'],
        parentId: 'search',
    });
    chrome.contextMenus.onClicked.addListener(function (info, tab) {
        if (info.menuItemId === "bilibili") { // here's where you'll need the ID
            // do something
            console.log('info', info)
            console.log('tab', tab)
            chrome.tabs.create({ url: `https://search.bilibili.com/all?keyword=${info.selectionText}&from_source=webtop_search` });
        }
        // else if (info.menuItemId === "baidu") { // here's where you'll need the ID
        //     // do something
        //     console.log('info', info)
        //     console.log('tab', tab)
        //     chrome.tabs.create({ url: `https://www.baidu.com/s?ie=UTF-8&wd=%E7%99%BE%E5%BA%A6${info.selectionText}&from_source=webtop_search` });
        // }
        else if (info.menuItemId === "baidubaike") { // here's where you'll need the ID
            // do something
            console.log('info', info)
            console.log('tab', tab)
            chrome.tabs.create({ url: `https://baike.baidu.com/search?word=${info.selectionText}&from_source=webtop_search` });
        }
    });
});

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
        var port = chrome.runtime.connectNative('com.example.native');

        port.onMessage.addListener(function (msg) {
            console.log('Received message from Python:', msg);
            // 在这里处理来自 Python 的消息
            console.log("hi");
        });

        port.postMessage({ text: 'Hello from the extension!' });
    });
}
