$(function () {
    // chrome.storage.sync.get('input', function (va) {
    //     //刷新仍存储更新值
    //     $('#h1').text(va.input);
    //     // console.log(va.input);
    // })

    // $('#button1').click(function () {
    //     //获取id为limit的内容
    //     var input = $('#input1').val();
    //     if (input) {
    //         chrome.storage.sync.set({ 'input': input }, function () {
    //             // close();
    //         });
    //     }
    //     //更新h1的值
    //     $('#h1').text(input);
    // });

    //设置
    var slider = document.getElementById('slider');
    var aaa = document.querySelector('.a');
    var bbb = document.querySelector('.bbb');
    var ccc = document.querySelector('#fontColor');
    window.onload = function () {
        slider.addEventListener('input', function (e) {
            aaa.style.fontSize = e.target.value + 'px'
        });
        bbb.onclick = function () {
            aaa.style.color = '#' + ccc.value;
        }
    }
    var array = [];
    var allText = ""
    window.onload = function () {
        onnload();
    }
    function onnload() {
        var tags = document.body.getElementsByTagName('*');
        for (var i = 0; i < tags.length; i++) {
            if (tags[i].nodeName != "SCRIPT" && tags[i].nodeName != "STYLE" && tags[i].nodeName != "TEXTAREA") {
                //过滤script、style和textarea标签
                array.push(getText(tags[i]));
            }
        }
    }
    var getText = function (dom) {
        dom.style.color = localStorage.getItem('color')
        dom.style.fontSize = localStorage.getItem('size')
        allText = dom.innerHTML
        allText = allText.replace(/<\/?.+?\/?>/g, '')//去除标签
        allText = allText.replace(/\s+/g, '');//去除空格
        if (allText == "") return;
        // console.log(allText)
        // allText.color = 'red'
        return allText;
    }
    bbb.onclick = function () {
        localStorage.setItem('size', slider.value + 'px');
        localStorage.setItem('color', '#' + ccc.value);
        onnload();
    }

});