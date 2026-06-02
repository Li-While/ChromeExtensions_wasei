//选择大盒子
// var element = document.getElementById("container");
var element = document.querySelector('html');
// var input = document.querySelector('#kw');
// console.log(input.value);
// input.onblur = function () {
//     var value = input.value
//     console.log(value);
// }

//添加div标签
var div = document.createElement("div");
//添加属性
div.setAttribute("class", "menu-box");
//找到所需添加位置之后的标签(此标签在大盒子里),也可以不找默认添加在大盒子里头的末尾
// var child = document.getElementById("");
//为面板中添加内容
var div1 = document.createElement("div");
div1.setAttribute("class", "menu-button");
div.insertBefore(div1, null);
var div2 = document.createElement("div");
div2.setAttribute("class", "line-box");
div1.insertBefore(div2, null);
var div3 = document.createElement("div");
var div4 = document.createElement("div");
var div5 = document.createElement("div");
div3.setAttribute("class", "line");
div4.setAttribute("class", "line");
div5.setAttribute("class", "line");
div2.insertBefore(div3, null);
div2.insertBefore(div4, null);
div2.insertBefore(div5, null);

var ul = document.createElement("ul");
ul.setAttribute("class", "menu-list");
div.insertBefore(ul, null);

var header = document.createElement("div");
header.setAttribute("class", "frog-graph-header");
ul.insertBefore(header, null);

var keywordLabel = document.createElement("div");
keywordLabel.setAttribute("id", "frog-search-keyword");
keywordLabel.textContent = "等待搜索词";
header.insertBefore(keywordLabel, null);

var statusLabel = document.createElement("div");
statusLabel.setAttribute("id", "frog-graph-status");
statusLabel.textContent = "打开百度搜索页后会自动联动";
header.insertBefore(statusLabel, null);

// sousuo
// var div6 = document.createElement("div");
// div6.setAttribute("class", "search-boxs");
// ul.insertBefore(div6, null);

// var input1 = document.createElement("input");
// input1.setAttribute("type", "text");
// input1.setAttribute("class", "search-txt");
// input1.setAttribute("placeholder", "想搜啥？");
// div6.insertBefore(input1, null);
// var a1 = document.createElement("a");
// a1.setAttribute("class", "search-btn-xuanfu");
// div6.insertBefore(a1, null);
// var i1 = document.createElement("i");
// i1.setAttribute("class", "fa fa-search");
// i1.setAttribute("aria-hidden", "true");
// a1.insertBefore(i1, null);

// xuanfu
var div7 = document.createElement("div");
div7.setAttribute("id", "chart3")
div7.setAttribute("style", "width: 400px;height:260px;margin: 0 auto;");
ul.insertBefore(div7, null);

var detail = document.createElement("div");
detail.setAttribute("class", "frog-node-detail");
detail.innerHTML = [
    '<div class="modal_name">未选择节点</div>',
    '<div class="modal_desc"></div>',
    '<div class="modal_easyget"></div>',
    '<div class="modal_curelasttime"></div>',
    '<div class="modal_department"></div>',
    '<div class="modal_cause"></div>',
    '<div class="modal_prevent"></div>'
].join("");
ul.insertBefore(detail, null);
// var script2 = document.createElement("script");
// script2.setAttribute("src", "./chart1.js")
// ul.insertBefore(script2, null);

//将面板添加在body的大盒子里
element.insertBefore(div, null);

// 要操作的元素
const menu_box = document.querySelector('.menu-box');
const menu_button = document.querySelector('.menu-button');

// 为菜单按钮绑定点击事件
menu_button.addEventListener('click', function () {
    menu_box.classList.toggle('active');
    if (window.frogGraphChart) {
        window.frogGraphChart.resize();
    }
})

// chrome.runtime.openOptionsPage();
// let opening = chrome.runtime.openOptionsPage();
// let opening = browser.runtime.openOptionsPage();

// function onOpened() {
//     console.log(`Options page opened`);
// }

// function onError(error) {
//     console.log(`Error: ${error}`);
// }

// let opening = chrome.runtime.openOptionsPage();
// opening.then(onOpened, onError);
