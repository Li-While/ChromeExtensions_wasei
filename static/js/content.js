// 注入网页的脚本
// 监听来自content的消息
//可以监听popup的操作,返回到主界面中

const FROG_GRAPH_API = 'http://127.0.0.1:5000/api/graph';
let frogLastKeyword = '';
let frogSearchTimer = null;

function frogSetStatus(message) {
    const status = document.getElementById('frog-graph-status');
    if (status) {
        status.textContent = message;
    }
}

function frogSetKeyword(keyword) {
    const label = document.getElementById('frog-search-keyword');
    if (label) {
        label.textContent = keyword ? '搜索词：' + keyword : '等待搜索词';
    }
}

function frogFindSearchInput() {
    return document.querySelector('#kw') ||
        document.querySelector('input[name="wd"]') ||
        document.querySelector('input[name="q"]') ||
        document.querySelector('textarea[name="q"]') ||
        document.querySelector('input[type="search"]');
}

function frogReadSearchKeyword() {
    const url = new URL(window.location.href);
    const params = ['wd', 'word', 'q', 'query', 'keyword'];
    for (let i = 0; i < params.length; i++) {
        const value = url.searchParams.get(params[i]);
        if (value) {
            return value.trim();
        }
    }
    const input = frogFindSearchInput();
    return input ? input.value.trim() : '';
}

function frogFetchGraph(keyword) {
    keyword = (keyword || '').trim();
    frogSetKeyword(keyword);
    if (!keyword || keyword === frogLastKeyword) {
        return;
    }
    frogLastKeyword = keyword;
    frogSetStatus('正在查询 Neo4j...');
    fetch(FROG_GRAPH_API + '?q=' + encodeURIComponent(keyword))
        .then(function (response) {
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            return response.json();
        })
        .then(function (payload) {
            if (typeof window.frogDrawGraph === 'function') {
                window.frogDrawGraph(payload.result);
            }
        })
        .catch(function (error) {
            frogSetStatus('无法连接 Flask/Neo4j：' + error.message);
        });
}

function frogSetDarkMode(enabled) {
    let darkStyle = document.getElementById("frog-dark-style");
    if (enabled) {
        if (!darkStyle) {
            darkStyle = document.createElement("style");
            darkStyle.id = "frog-dark-style";
            darkStyle.textContent = `
                html, body {
                    background: #1e1e1e !important;
                    color: #ddd !important;
                }

                div, section, article, aside, main {
                    background-color: #1e1e1e !important;
                    color: #ddd !important;
                }

                input, textarea {
                    background: #2b2b2b !important;
                    color: #fff !important;
                    border: 1px solid #555 !important;
                }

                a {
                    color: #6cb6ff !important;
                }
            `;
            document.head.appendChild(darkStyle);
        }
    } else if (darkStyle) {
        darkStyle.remove();
    }
}

function frogOpenSearchPanel() {
    const menuBox = document.querySelector('.menu-box');
    if (!menuBox) {
        return;
    }
    menuBox.classList.add('active');
    frogScheduleSearchSync();
    if (window.frogGraphChart) {
        setTimeout(function () {
            window.frogGraphChart.resize();
        }, 300);
    }
}

function frogScheduleSearchSync(keyword) {
    window.clearTimeout(frogSearchTimer);
    frogSearchTimer = window.setTimeout(function () {
        frogFetchGraph(keyword || frogReadSearchKeyword());
    }, 300);
}

// function frogWatchSearchInput() {
//     const input = frogFindSearchInput();
//     if (input && !input.dataset.frogGraphBound) {
//         input.dataset.frogGraphBound = '1';
//         input.addEventListener('input', function () {
//             frogScheduleSearchSync(input.value);
//         });
//         input.addEventListener('change', function () {
//             frogScheduleSearchSync(input.value);
//         });
//         input.form && input.form.addEventListener('submit', function () {
//             frogScheduleSearchSync(input.value);
//         });
//     }
//     frogScheduleSearchSync();
// }
function frogWatchSearchInput() {

    const input = frogFindSearchInput();

    if (!input) {
        return;
    }

    if (input.dataset.frogGraphBound === '1') {
        return;
    }

    input.dataset.frogGraphBound = '1';

    input.addEventListener('input', function () {

        frogScheduleSearchSync(input.value);

    });

    input.addEventListener('change', function () {

        frogScheduleSearchSync(input.value);

    });

    if (input.form) {

        input.form.addEventListener('submit', function () {

            frogScheduleSearchSync(input.value);

        });

    }

    frogScheduleSearchSync();
}

frogWatchSearchInput();
new MutationObserver(frogWatchSearchInput).observe(document.documentElement, {
    childList: true,
    subtree: true
});
window.addEventListener('popstate', function () {
    frogScheduleSearchSync();
});

chrome.storage.local.get({ frogDarkMode: false }, function (result) {
    frogSetDarkMode(result.frogDarkMode);
});

//移除百度右侧table
const right_ad = document.querySelector('#content_right');
if (right_ad) {
    right_ad.remove();
}

// 调色板
//接收消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.todo == "changeColor") {
        var addColor = '#' + request.clickedColor;
        $('.content-right_8Zs40').css('color', addColor);
        $('.c-border').css('color', addColor);
        $('.a0').css('color', addColor);
        $('.p1').css('color', addColor);
        $('#head').css('color', addColor);
        // chrome.storage.local.set({ key: "value local" }, function () {
        //     console.log('Value is set to ' + addColor);
        // });

        chrome.storage.local.get(['key'], function (result) {
            console.log('Value currently is ' + result.key);
        });
    };

});

//夜间模式
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     // var element = document.querySelector('html');
//     // var script = document.createElement("script");
//     // element.insertBefore(script, null);
//     // script.setAttribute("src", "https://cdn.jsdelivr.net/npm/darkmode-js@1.3.4/lib/darkmode-js.min.js");
//     var options = {
//         bottom: '64px', // default: '32px'
//         right: 'unset', // default: '32px'
//         left: '32px', // default: 'unset'
//         time: '0.5s', // default: '0.3s'
//         mixColor: '#fff', // default: '#fff'
//         backgroundColor: '#fff',  // default: '#fff'
//         buttonColorDark: '#100f2c',  // default: '#100f2c'
//         buttonColorLight: '#fff', // default: '#fff'
//         saveInCookies: false, // default: true,
//         label: '&#x1f313;' // default: ''
//     }
//     // console.log(request.action);
//     if (request.action == "open_close") {
//         console.log(1);
//         const darkmode = new Darkmode(options);
//         darkmode.showWidget();
//         var video = document.querySelectorAll('video');
//         video.setAttribute("class", "darkmode-ignore");
//     }
// })

//夜间模式
// var flag = true;
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     var tags = document.querySelector('html');
//     var imgs = document.querySelectorAll('img');
//     // var video = document.querySelectorAll('video');
//     // console.log(imgs)
//     // console.log(video)
//     if (request.action == "close") {
//         if (flag) {
//             tags.classList.add("tags");
//             for (var i = 0; i < imgs.length; i++) {
//                 // tags.className("tags");
//                 // imgs[i].classList.add("tags");
//                 imgs[i].style = "filter: invert(1)";
//                 // video[i].style = "filter: invert(1)"
//                 // video[i].classList.remove("tags");
//             }
//             flag = !flag;
//             // alert('关灯了')
//         }
//         else {
//             tags.classList.remove("tags");
//             for (var i = 0; i < imgs.length; i++) {
//                 // tags.classList.remove("tags");
//                 // imgs[i].classList.remove("tags");
//                 imgs[i].style = "filter: invert(0)";
//                 // video[i].style = "filter: invert(0)"
//                 // video[i].classList.remove("tags");
//             }
//             flag = !flag;
//             // alert('开灯了')
//         };
//     }
// })
chrome.runtime.onMessage.addListener(function (request) {

    if (request.action === "toggleDarkMode") {
        frogSetDarkMode(request.enabled);
    }
});

//搜索
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     if (request.action == "sousuo") {
//         // alert('我是搜索')
//     }
// })
// 搜索悬浮窗
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    if (request.action == "sousuo" || request.action == "openSearchPanel") {
        frogOpenSearchPanel();
    }
})


//设置
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     if (request.action == "set") {
//         const newWindow = window.open(opening);
//         newWindow.opener = null;
//         alert('我是设置')
//         // const newWindow = window.open("http://120.53.9.241/");
//         // let myAddonId = chrome.runtime.id;
//         // chrome.runtime.connect(
//         //     extensionId = myAddonId
//         // )
//         // console.log(myAddonId);
//         // console.log(extensionId);
//         // const jsPath = '/templates/options.html';
//         // const temp = chrome.runtime.getURL(jsPath);
//         // const newWindow = window.open(temp);
//         // newWindow.opener = null;
//     }
// })
