// ==UserScript==
// @name         fungif
// @namespace    http://sc2tv.ru
// @version      0.1
// @description  sc2tv & funstream chat gifs paste
// @author       Domitori
// @require      https://github.com/carlo/jquery-base64/raw/master/jquery.base64.min.js
// @include      http://sc2tv.ru/*
// @match        http://sc2tv.ru/*
// @include      http://funstream.tv/*
// @match        http://funstream.tv/*
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-end
// ==/UserScript==

(function () {

    function GM_wait() { 
        if (typeof unsafeWindow.$ == 'undefined')
            setTimeout(GM_wait, 100); 
        else
            GM_run();
    }
    GM_wait();

    function GM_run() {
        var $ = unsafeWindow.$;
        var xhr;

        var queryData = {
            v: '1.0',
            as_filetype: 'gif',
            rsz: 8,
            q: '',
            start: 0
        };

        var $chatInput;

        var $button = $('<i style="position:absolute;width:17px;height:17px;top:5px;right:25px;z-index:10;cursor:pointer;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABklBMVEX///83axlTdKo3axlbe6pRdKhPcqtIbahYd6tYeatKcKo5ZKY6ZKY6ZKg6Zqg8ZqhDa6hDa6pFbapFbatGbag3axk3axlHc2w9a13c3t43axk/cCJCYoFMezFTjChVfaRWf6ZXjy1YgqxcgZZdh0dgiUllgI9mjk9ulV9ulpxunptyoaFyp9xzqN1zqd1zqt51reV2nqZ6oKt6orp7mqV8o7p9oaR+pLqApruBpLaBq2GCuuSDpbaDqLyDuuSEpbSHuWCHumCIq76IvciLumKMvGWNumSPu2qPvGeWxN+YxeKZwdOdx+ar2fKr2vOs2vOt3PGt3PKu2u+v3fKv3fSv3vav3/ew3fWw3vWw3vax05Cx1pKx4Piy0pWy4fq01JW04/y15P215f621JzQ5rrX6P3X6P7m7fbm7vTn7/bo7vHo7/fq7O7q8ffr8Pfr8vfr8vjs8Pbs8Pfs8fft8vft8vju8vfu8/fu8/jv8vfv8/fv8/jv9Pfv9Pjw8vfw8/jx8vPx9Pfy8/Py9Pfz9Pf///9cyHRiAAAAGnRSTlMAiIqMjY/D4ejp7/Dw8PDw8PDw8PDy9/f4/kBWqswAAADISURBVBgZBcFLSgNBEIDhv2qqkwxGGSH42Ing4xguBPEk4q3MKVwIniO4EEJwEVAXyqh0dXf5fQAAAAAIZvMMEEA3upGGe43m4tXDH9zYuVvupSKqkrY3/Y/hdnA0dZWJampgUPv96AGgBQaeR/XSpKUaYOAfQ4v817E7BhjU3w0RAZ/fgBGhggBeZ88JAweAPJylzUtnVMtfAHpSztcXoyFxKwCP/SlXKzPcj6VE1LZ+vX6aFUFtHgDTyeXhdvUmAAAgi+Tv8Q/rE1ZhxNifkQAAAABJRU5ErkJggg==) no-repeat;"></i>');
        var $searchForm = $('<form><input type="text" name="q" style="font-size:1.389em;line-height:23px;min-height:29px;margin:2%;width:96%;" /></form>');
        var $prevButton = $('<li style="width:50%!important">Назад</li>');
        var $nextButton = $('<li style="width:50%!important">Далее</li>');
        var $results = $('<div class="smiles_wrapper ps-container" style="height:400px;overflow-y:auto!important;"></div>');
        var $modal = $('<div class="popup_smiles popup popup_clickclose" style="bottom:61px;"></div>')
        .append($searchForm)
        .append($results)
        .append($('<ul class="pagination"></ul>').append($prevButton).append($nextButton));

        function init() {
            $chatInput = $('div.chatTools-container div.text_block div.text');
            if ($chatInput.length <= 0)
                return;

            $button.click(function (e) {
                $modal.toggle();
                $searchForm.find('input[name=q]').focus().select();
            });
            $(unsafeWindow.document).mouseup(function (e) {
                if ((!$modal.is(e.target)&& $modal.has(e.target).length === 0)
                    && (!$button.is(e.target)&& $button.has(e.target).length === 0))
                {
                    $modal.hide();
                }
            });
            $searchForm.submit(searchSubmit);
            $nextButton.click(function (e) {
                queryData.start += queryData.rsz;
                makeQuery();
            });
            $prevButton.click(function (e) {
                if (queryData.start <= 0)
                    return;
                queryData.start -= queryData.rsz;
                makeQuery();
            });

            $('.text_block').prepend($button);
            $('.chatTools-container').append($modal);
            $modal.toggle();
        };

        function searchSubmit(e) {
            queryData.q = $searchForm.find('input[name=q]').val();
            makeQuery();

            e.preventDefault();
        };

        function makeQuery () {
            if (xhr)
                xhr.abort();
            if (!queryData.q)
                return;

            $results.html('<span style="color:#fff;font-size:1.5em;">Загрузка...</span>');
            xhr = $.ajax({url: 'https://ajax.googleapis.com/ajax/services/search/images',
                          jsonp: 'callback',
                          dataType: 'jsonp',
                          data: queryData
                         }).done(searchDone);
        }

        function searchDone(e) {
            $results.empty();
            if (!e.responseData.results)
                return;

            e.responseData.results.forEach(function (result) {
                $result = createResultElement(result);
                /*$result.hover(function () {
                    $(this).attr('src', $(this).data('result').url);
                }, function () {
                     $(this).attr('src', $(this).data('result').tbUrl);
                });*/
                $result.click(function (e) {
                    var $this = $(this);
                    angular.element($('html')).injector().get('chat').sendMessage('http://v20523.hosted-by-vdsina.ru/' + $.base64.encode($this.data('result').url) + '.jpg');
                    $chatInput.focus();
                    $modal.hide();
                });
                $results.append($result);
            });
        };

        function createResultElement(result) {
            return $('<img src="' + result./*tbUrl*/url + '" style="display:block;width:' + result.tbWidth + 'px;height:' + result.tbHeight + 'px;margin:5px auto;cursor:pointer";>').data('result', result);
        };

        function initTry() {
            if ($('.text_block').length <= 0)
                setTimeout(initTry, 1000);
            else
                init();
        };

        initTry();
    }

})();