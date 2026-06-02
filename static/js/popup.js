function sendActiveTabMessage(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs || !tabs[0] || !tabs[0].id) {
            return;
        }
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
}

function bindTip(buttonSelector, tipSelector) {
    var opacity = 1;
    var tip = document.querySelector(tipSelector);
    $(buttonSelector).mouseenter(function () {
        tip.style.opacity = 1;
        tip.style.display = 'block';
    });
    $(buttonSelector).mouseleave(function () {
        var timer = setInterval(function () {
            tip.style.opacity = opacity - 0.1;
            opacity -= 0.1;
            if (tip.style.opacity < 0) {
                clearInterval(timer);
                tip.style.opacity = 1;
                opacity = 1;
                tip.style.display = 'none';
            }
        }, 50);
    });
}

$(function () {
    var color = $('#fontColor').val();
    $('#fontColor').on("change paste keyup", function () {
        color = $(this).val();
    });
    $('#btnChange').click(function () {
        sendActiveTabMessage({ todo: "changeColor", clickedColor: color });
    });

    chrome.storage.local.get({ frogDarkMode: false }, function (result) {
        $('#dian').css('display', result.frogDarkMode ? 'none' : 'block');
    });

    $("#close").click(function () {
        chrome.storage.local.get({ frogDarkMode: false }, function (result) {
            var enabled = !result.frogDarkMode;
            chrome.storage.local.set({ frogDarkMode: enabled });
            $('#dian').css('display', enabled ? 'none' : 'block');
            sendActiveTabMessage({ action: "toggleDarkMode", enabled: enabled });
        });
    });

    $("#sousuo").click(function () {
        sendActiveTabMessage({ action: "openSearchPanel" });
        window.close();
    });

    $("#set").click(function () {
        chrome.runtime.openOptionsPage();
        window.close();
    });

    bindTip("#close", ".speech-bubble-left1");
    bindTip("#sousuo", ".speech-bubble-left2");
    bindTip("#set", ".speech-bubble-right1");
});


// function onOpened() {
//     console.log(`Options page opened`);
// }

// function onError(error) {
//     console.log(`Error: ${error}`);
// }

// let opening = chrome.runtime.openOptionsPage();
// opening.then(onOpened, onError);

// window.onload = () => {
//     const $spendAmount = document.querySelector('#spendAmount')
//     const $amount = document.querySelector('#amount')
//     const $total = document.querySelector('#total')
//     chrome.storage.sync.get('total', function (budget) {
//         $total.textContent = budget.total
//     })

//     $spendAmount.addEventListener("click", () => {
//         chrome.storage.sync.get('total', function (budget) {
//             let newTotal = 0
//             if (budget.total) {
//                 newTotal += parseInt(budget.total)
//             }
//             const amount = $amount.value
//             if (amount) {
//                 newTotal += parseInt(amount)
//             }
//             chrome.storage.sync.set({ "total": newTotal })

//             $total.textContent = newTotal
//             $amount.value = ''
//         })
//     })
// }
