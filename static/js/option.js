$(function () {
    // $('#resetTotal').click(function () {
    //     chrome.storage.sync.set({ 'total': 0 }, function () {
    //         var notifOptions = {
    //             type: 'basic',
    //             iconUrl: 'icon2.png',
    //             title: 'Total reset',
    //             message: "Total has been reset to 0!"
    //         };
    //         chrome.notifications.create('limitNotif', notifOptions);

    //     });
    // });

    chrome.storage.sync.get('language', function (value) {
        //刷新仍存储更新值
        $('#language').val(value.language);
        console.log(value.language);
    })

    $('#button2').click(function () {
        //获取id为limit的内容
        var language = $('#language option:selected').val();//选中的值
        if (language) {
            chrome.storage.sync.set({ 'language': language }, function () {
                // close();
            });
        }
        //更新h1的值
        $('#language').val(language);
    });

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

    //滑动条
    var a = document.querySelector('#slider')
    a.addEventListener('input', function (e) {
        // aaa.style.fontSize = e.target.value + 'px'
        console.log(a.value);
    });
});