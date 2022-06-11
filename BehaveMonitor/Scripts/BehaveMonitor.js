const demo_flag = 0;                                    // 0:デモモードOFF、1:デモモードON
const AdminRowNo = 0;                                   // 管理者マスタ対象行番号

const AdminMstPath = "./data/adminmst.csv";             // 管理者マスタファイルパス
const TerminalMstPath = "./data/terminalmst.csv";       // 端末マスタファイルパス
const HistoryDataPath = "./data/historydata.csv";       // 行動履歴データファイルパス

var MapObj;
var MapTypeIdx = 0;
var AdminMst = [];                                      // 管理者情報
var TerminalMst = [];                                   // 端末マスタ
var Markers = [];
var InfoWindow = [];
var ViewType;
var TargetId;

const ColAdminMst = {
    UserID: 0,
    Psw: 1,
    UserName: 2,
    Locate: 3,
    Latitude: 4,
    Longitude: 5,
    IntervalSec: 6,
    Terminals: 7
};

const ColTerminalMst = {
    RowNum: 0,
    TerminalID: 1,
    ActiveFlag: 2,
    BatteryChangeDate: 3,
    SheepID: 4,
    SheepGroup: 5,
    Filler: 6
};

const ColHistoryData = {
    SheepID: 0,
    SheepGroup: 1,
    GetDateTime: 2,
    Latitude: 3,
    Longitude: 4,
    Speed: 5,
    Flag: 6
};

/// _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
///
/// 各データ取得
///
/// _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

/*
 * 管理者マスタ取得
 */
function GetAdminMst() {
    let _adminMst;

    if (demo_flag == 0) {
        // CSVデータ読込み
        _adminMst = GetCsvData(AdminMstPath);
    } else {
    }

    // 戻り値設定
    return _adminMst;
}

/*
 * 端末マスタ取得
 */
function GetTerminalMst() {
    let _terminalMst;
    let _terminalCnt = 0;

    if (demo_flag == 0) {
        // CSVデータ読込み
        _terminalMst = GetCsvData(TerminalMstPath);
        _terminalCnt = _terminalMst.length;

        // 並び替え
        _terminalMst.sort(function (a, b) {
            // ID：昇順
            if (a[ColTerminalMst.SheepID] > b[ColTerminalMst.SheepID]) return 1;
            if (a[ColTerminalMst.SheepID] < b[ColTerminalMst.SheepID]) return -1;
            return 0;
        })

        let j = 0;
        for (i = 0; i < _terminalMst.length; i++) {
            if (_terminalMst[i][ColTerminalMst.ActiveFlag] == '1') {
                TerminalMst[j] = _terminalMst[i];
                j++;
            }
        }

        let _SheepGrp = '';
        for (i = 0; i < TerminalMst.length; i++) {
            if (_SheepGrp != TerminalMst[i][ColTerminalMst.SheepGroup]) {
                let _op = document.createElement('option');
                _op.value = TerminalMst[i][ColTerminalMst.SheepGroup].replace(/\r?\n/g, '');
                document.getElementById('dt1').appendChild(_op);
                _SheepGrp = _op.value;
            }
        }

        MakeSheepIdList('');
    } else {
    }

    // 送信機情報設定
    let _table1 = MakeTransmitterInfo(_terminalCnt);
    document.getElementById('transmitterInfo1').appendChild(_table1);

    let _table2 = MakeTransmitterInfo(_terminalCnt);
    document.getElementById('transmitterInfo2').appendChild(_table2);
}

/*
 * 行動履歴データ取得
 */
function GetHistoryData() {
    let _historyData;

    if (demo_flag == 0) {
        // CSVデータ読込み
        _historyData = GetCsvData(HistoryDataPath);
    } else {
    }

    // 戻り値設定
    return _historyData;
}

/// _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
///
/// MAP表示
///
/// _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

/*
 * 地図初期表示設定
 */
function InitMap() {
    // 管理者マスタ読込み
    AdminMst = GetAdminMst();

    // 地図初期表示設定
    MakeMap(AdminMst[AdminRowNo][ColAdminMst.Latitude], AdminMst[AdminRowNo][ColAdminMst.Longitude]);
}

/*
 * 地図表示
 */
function MakeMap(pLat, pLng) {
    var _mapPosition = new google.maps.LatLng({ lat: parseFloat(pLat), lng: parseFloat(pLng) });
    var _mapArea = document.getElementById('gmap');
    var _mapOptions = {
        center: _mapPosition,
        mapTypeControl: false,
        streetViewControl: false,
        rotateControl: false,
        scaleControl: true,
        fullscreenControl: false,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
        },
        mapTypeId: SetMapType(),
        controlSize: 24,
        zoom: 16
    };

    MapObj = new google.maps.Map(_mapArea, _mapOptions);
}

/*
 * マップ中央座標移動
 */
function MoveCenter() {
    MapObj.panTo(new google.maps.LatLng(AdminMst[AdminRowNo][ColAdminMst.Latitude], AdminMst[AdminRowNo][ColAdminMst.Longitude]));
}

/*
 * 地図表示切替
 */
function ChangeMapType(pType) {
    MapTypeIdx = Number(pType);
    MapObj.setMapTypeId(SetMapType());
}

window.addEventListener('DOMContentLoaded', function () {
    $('.dropdown-menu .dropdown-item').click(function () {
        var visibleItem = $('.dropdown-toggle', $(this).closest('.dropdown'));
        visibleItem.text($(this).attr('value'));
    });
});

/*
 * 地図表示タイプ取得
 */
function SetMapType() {
    let _mapType = google.maps.MapTypeId.SATELLITE;
    if (MapTypeIdx == 1) {
        _mapType = google.maps.MapTypeId.ROADMAP;
    } else if (MapTypeIdx == 2) {
        _mapType = google.maps.MapTypeId.TERRAIN;
    }

    return _mapType;
}

/*
 * 送信機情報設定
 */
function MakeTransmitterInfo(pTerminalCnt) {
    // table要素を生成
    let _table = document.createElement('transmittertable');

    for (let i = 0; i < 4; i++) {
        let _item = '';
        let _cnt = 0;
        switch (i) {
            case 0:
                _item = '総数';
                _cnt = pTerminalCnt;
                break;
            case 1:
                _item = '稼働数';
                _cnt = TerminalMst.length;
                break;
            case 2:
                _item = '移動無し数';
                _cnt = 0;
               break;
            case 3:
                _item = 'データ未送数';
                _cnt = 0;
                break;
            default:
                _item = '';
                _cnt = 0;
        }

        // tr要素を生成
        var _tr = document.createElement('tr');

        // ----------
        // td要素を生成
        var _td = document.createElement('td');

        // td要素内にテキストを追加
        _td.textContent = _item;

        // td要素をtr要素の子要素に追加
        _tr.appendChild(_td);

        // ----------
        // td要素を生成
        var _td = document.createElement('td');

        // td要素内にテキストを追加
        _td.textContent = '：';

        // td要素をtr要素の子要素に追加
        _tr.appendChild(_td);

        // ----------
        // td要素を生成
        var _td = document.createElement('td');

        // td要素内にテキストを追加
        _td.textContent = _cnt;

        // td要素をtr要素の子要素に追加
        _tr.appendChild(_td);

        // tr要素をtable要素の子要素に追加
        _table.appendChild(_tr);
    }

    return _table;
    //// 生成したtable要素を追加する
    //document.getElementById('transmitterInfo1').appendChild(_table);
    //document.getElementById('transmitterInfo2').appendChild(_table);
}

/*
 * 羊リスト作成
 */
function MakeSheepIdList(pSheepGrp) {
    const _SheepIdList = document.getElementById('dt2');
    while (_SheepIdList.lastChild) {
        _SheepIdList.removeChild(_SheepIdList.lastChild);
    }

    for (i = 0; i < TerminalMst.length; i++) {
        if (pSheepGrp == '' || pSheepGrp == TerminalMst[i][ColTerminalMst.SheepGroup]) {
            let _op = document.createElement('option');
            _op.value = TerminalMst[i][ColTerminalMst.SheepID];
            document.getElementById('dt2').appendChild(_op);
        }
    }
}

function GetSheepInfoMode() {
    const _SheepInfoMode = document.getElementById("SheepInfoMode1");

    let _resulet;
    if (_SheepInfoMode.checked) {
        _resulet = 0;
    } else {
        _resulet = 1;
    }
    return _resulet;
}

/*
 * 最終地点表示（全頭／グループ）
 */
function ViewFinalPoint(pCurrentList) {
    let _key = '';

    let _day = new Date();
    _day.setDate(_day.getMinutes() - 30);
    //    let referencetime = SystemDateTime(_day);
    let referencetime = '2021/05/21 13:40:00';

    // 非活動ID退避
    let _noActive = [];
    for (_idx = 0; _idx < TerminalMst.length; _idx++) {
        if (TerminalMst[_idx][ColTerminalMst.ActiveFlag] = '1') {
            _noActive[_idx] = TerminalMst[_idx][ColTerminalMst.SheepID];
        }
    }

    let j = 0;
    for (i = 0; i < pCurrentList.length; i++) {
        // 非活動IDチェック
        if (_noActive.includes(pCurrentList[i][0]) == false) {
            continue;
        }

        // 対象データチェック
        let _target_flag = false;
        if (TargetId == '') {
            // 全頭表示
            if (_key != pCurrentList[i][0]) {
                _target_flag = true;
            }
        } else {
            // グループ表示
            if (_key != pCurrentList[i][0] && TargetId == pCurrentList[i][1]) {
                _target_flag = true;
            }
        }

        // マーカー表示
        if (_target_flag == true) {
            DisplayData[j] = pCurrentList[i];
            DisplayData[j].push('0');

            let _pointer = './img/Sheep32_0.png';
            if (referencetime > DisplayData[j][ColHistoryData.GetDateTime]) {
                _pointer = './img/Sheep32_1.png';
                DisplayData[j][ColHistoryData.Flag] = '1';
            }

            // マーカー座標設定
            let _latlng = new google.maps.LatLng(DisplayData[j][ColHistoryData.Latitude], DisplayData[j][ColHistoryData.Longitude]);
            Markers[j] = new google.maps.Marker({
                position: _latlng,
                map: MapObj,
                icon: _pointer,
                animation: google.maps.Animation.DROP
            });

            // 吹き出し設定
            let _contentStr = '<div class="sample"><b>' + DisplayData[j][ColHistoryData.SheepID] + '</b><br>' + DisplayData[j][ColHistoryData.GetDateTime] + '</div>';
            let _iwopts = {
                content: _contentStr,
                positon: _latlng
            };
            InfoWindow[j] = new google.maps.InfoWindow(_iwopts);

            // マーカーにクリックイベントを追加
            MarkerEvent(j);

            _key = pCurrentList[i][0];
            j++;
        }
    }
}

/*
 * 軌跡表示（一頭）
 */
function ViewHistory(pCurrentList) {
    let ICON_CIRCLE_0 = {
        path: google.maps.SymbolPath.CIRCLE,    //円を指定
        scale: 7,                               //円のサイズ
        fillColor: 'rgb(255, 255, 0)',          //塗り潰し色
        fillOpacity: 0.9,                       //塗り潰し透過率
        strokeColor: 'rgb(255, 255, 0)',        //枠の色
        strokeWeight: 1                         //枠線の幅
    };

    let ICON_CIRCLE_1 = {
        path: google.maps.SymbolPath.CIRCLE,    //円を指定
        scale: 7,                               //円のサイズ
        fillColor: 'rgb(255, 0, 0)',            //塗り潰し色
        fillOpacity: 0.9,                       //塗り潰し透過率
        strokeColor: 'rgb(255, 0, 0)',          //枠の色
        strokeWeight: 1                         //枠線の幅
    };

    let LINE_FORWARD_ARROW = {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 2,
        fillColor: 'rgb(255, 255, 255)',        //塗り潰し色
        fillOpacity: 1,                         //塗り潰し透過率
        strokeColor: 'rgb(255, 255, 0)',
        strokeWeight: 1
    };

    let _patharray = new Array();
    let j = 0;
    let _historyIdx = 0;

    //let _day = new Date();
    //var referencetime = SystemDateTime(_day);
    let from_referencetime = '2021/05/21 08:59:59';
    let to_referencetime = '2021/05/21 16:00:00';

    let _checkDate = GetReferenceTime(from_referencetime, AdminMst[AdminRowNo][ColAdminMst.IntervalSec]);

    // 非活動ID退避
    let _noActive = [];
    for (_idx = 0; _idx < TerminalMst.length; _idx++) {
        if (TerminalMst[_idx][ColTerminalMst.ActiveFlag] = '1') {
            _noActive[_idx] = TerminalMst[_idx][ColTerminalMst.SheepID];
        }
    }

    let _SheepList = [];
    for (i = 0; i < pCurrentList.length; i++) {
        // 非活動IDチェック
        if (_noActive.includes(pCurrentList[i][0]) == false) {
            continue;
        }

        if (TargetId == pCurrentList[i][0]) {
            // console.log( DisplayData[j][ColHistory.time])
            if (to_referencetime < pCurrentList[i][2]) {
                break;
            }

            DisplayData[j] = pCurrentList[i];
            DisplayData[j].push('0');

            let _icon = ICON_CIRCLE_0;
            let _iconForecolor = 'rgb(0, 0, 0)';
            if (_checkDate < DisplayData[j][ColHistoryData.GetDateTime]) {
                _icon = ICON_CIRCLE_1;
                _iconForecolor = 'rgb(255, 255, 255)';

                while (_checkDate <= DisplayData[j][ColHistoryData.GetDateTime]) {
                    let _notDate = GetReferenceTime(_checkDate, AdminMst[AdminRowNo][ColAdminMst.IntervalSec] * -1);

                    _historyIdx++;
                    _SheepList[_historyIdx - 1] = MakeListData(_historyIdx, DisplayData[j][ColHistoryData.SheepID], _notDate, '1');
                    _checkDate = GetReferenceTime(_checkDate, AdminMst[AdminRowNo][ColAdminMst.IntervalSec]);
                }
            }

            // リスト用カウンター（+1）
            _historyIdx++;

            // マーカー座標設定
            let _latlng = new google.maps.LatLng(DisplayData[j][ColHistoryData.Latitude], DisplayData[j][ColHistoryData.Longitude]);
            Markers[j] = new google.maps.Marker({
                position: _latlng,
                map: MapObj,
                icon: _icon,
                label: {
                    text: _historyIdx.toString(),   //ラベル文字
                    color: _iconForecolor,          //文字の色
                    fontSize: '12px'                //文字のサイズ
                }
            });
            _SheepList[_historyIdx - 1] = MakeListData(_historyIdx, DisplayData[j][ColHistoryData.SheepID], DisplayData[j][ColHistoryData.GetDateTime], '0');

            // 吹き出し設定
            let _contentStr = '<div class="sample">' + DisplayData[j][ColHistoryData.GetDateTime] + '</div>';
            let _iwopts = {
                content: _contentStr,
                positon: _latlng
            };
            InfoWindow[j] = new google.maps.InfoWindow(_iwopts);

            // マーカーにクリックイベントを追加
            MarkerEvent(j);

            // Polyline座標設定
            _patharray[j] = _latlng;
            j++;

            _checkDate = GetReferenceTime(_checkDate, AdminMst[AdminRowNo][ColAdminMst.IntervalSec]);
        }
    };

    if (_patharray.length > 0) {
        // 最終地点マーカー座標再設定
        j--;
        Markers[j].setVisible(false);

        Markers[j] = new google.maps.Marker({
            position: _patharray[j],
            map: MapObj,
            icon: './img/Sheep32_0.png',
            animation: google.maps.Animation.DROP,
            label: {
                text: _historyIdx.toString(),   //ラベル文字
                color: 'rgb(0, 0, 0)',          //文字の色
                fontSize: '12px'                //文字のサイズ
            }
        });

        let _latlng = new google.maps.LatLng(DisplayData[j][ColHistoryData.Latitude], DisplayData[j][ColHistoryData.Longitude]);
        let _contentStr = '<div class="sample"><b>' + DisplayData[j][ColHistoryData.SheepID] + '</b><br>' + DisplayData[j][ColHistoryData.GetDateTime] + '</div>';
        let _iwopts = {
            content: _contentStr,
            positon: _latlng
        };
        InfoWindow[j] = new google.maps.InfoWindow(_iwopts);

        // マーカーにクリックイベントを追加
        MarkerEvent(j);

        // Polylineの初期設定
        var _polylineOpts = {
            map: MapObj,
            path: _patharray,
            icons: [
                { icon: LINE_FORWARD_ARROW, offset: '15%' },
                { icon: LINE_FORWARD_ARROW, offset: '30%' },
                { icon: LINE_FORWARD_ARROW, offset: '50%' },
                { icon: LINE_FORWARD_ARROW, offset: '70%' },
                { icon: LINE_FORWARD_ARROW, offset: '85%' }
            ],
            strokeColor: "rgb(255, 255, 0)",
            strokeOpacity: 0.5,		            //透明度0～1(def:1)
            strokeWeight: 3,			        //px指定（def:1)
            clickable: false,                   //ラインのクリック無効化
            zIndex: 1 						    //重なり順
        };

        // Polylineを作成
        Polyline = new google.maps.Polyline(_polylineOpts);
    }

    return _SheepList;
}

/*
 * 行動履歴リスト生成
 */
function MakeHistoryList(pSheepList) {
    $("#SheepList").bootstrapTable('destroy');
    let _SheepList = [];
    var userTable = $('#SheepList');
    userTable.bootstrapTable({
        filterControl: true,
        filterShowClear: true,
        data: _SheepList,
        columns: [
            {
                field: 'no',
                title: '経路',
                filterControl: 'select'
            },
            {
                field: 'Sheep_id',
                title: '識別番号',
                filterControl: 'input'
            },
            {
                field: 'Sheep_group',
                title: 'グループ',
                filterControl: 'select'
            },
            {
                field: 'timestamp',
                title: '時刻',
                filterControl: 'select'
            }
        ]
    });
    $("#SheepList").bootstrapTable('showColumn', 'no');
    $("#SheepList").bootstrapTable('hideColumn', 'Sheep_id');
    $("#SheepList").bootstrapTable('hideColumn', 'Sheep_group');

    let _idx = 0;
    for (i = pSheepList.length - 1; i >= 0; i--) {
        _SheepList[_idx] = {
            'no': pSheepList[i]['no'],
            'Sheep_id': pSheepList[i]['id'],
            'Sheep_group': pSheepList[i]['group'],
            'timestamp': pSheepList[i]['timestamp'],
            'status': pSheepList[i]['status']
        }
        _idx++;
    }
    $('#SheepList').bootstrapTable("load", _SheepList);
}

/*
 * 最終地点リスト生成
 */
function MakeFinalPointList() {
    $("#SheepList").bootstrapTable('destroy');
    let _SheepList = [];
    var userTable = $('#SheepList');
    userTable.bootstrapTable({
        filterControl: true,
        filterShowClear: true,
        data: _SheepList,
        columns: [
            {
                field: 'no',
                title: '経路',
                filterControl: 'select'
            },
            {
                field: 'Sheep_id',
                title: '識別番号',
                filterControl: 'input'
            },
            {
                field: 'Sheep_group',
                title: 'グループ',
                filterControl: 'select'
            },
            {
                field: 'timestamp',
                title: '時刻',
                filterControl: 'select'
            }
        ]
    });

    $("#SheepList").bootstrapTable('hideColumn', 'no');
    $("#SheepList").bootstrapTable('showColumn', 'Sheep_id');
    if (TargetId == '') {
        $("#SheepList").bootstrapTable('showColumn', 'Sheep_group');
    } else {
        $("#SheepList").bootstrapTable('hideColumn', 'Sheep_group');
    }

    let _SheepMaster = [];
    let _idx0 = 0;
    let _idx1 = 0;

    // 羊マスター該当データ抽出
    if (TargetId == '') {
        _SheepMaster = TerminalMst;
    } else {
        let j = 0;
        for (i = 0; i < TerminalMst.length; i++) {
            if (TerminalMst[i][ColTerminalMst.SheepGroup] == TargetId) {
                _SheepMaster[j] = TerminalMst[i];
                j++;
            }
        }
    }

    while (_SheepMaster.length > _idx0) {
        if (DisplayData.length > _idx1) {
            if (DisplayData[_idx1][ColHistoryData.SheepID] == _SheepMaster[_idx0][ColTerminalMst.SheepID]) {
                _SheepList[_idx0] = {
                    'no': _idx0 + 1,
                    'Sheep_id': _SheepMaster[_idx0][ColTerminalMst.SheepID],
                    'Sheep_group': _SheepMaster[_idx0][ColTerminalMst.SheepGroup],
                    'timestamp': DisplayData[_idx1][ColHistoryData.GetDateTime],
                    'status': DisplayData[_idx1][ColHistoryData.Flag]
                }
                _idx0++;
                _idx1++;
            } else if (DisplayData[_idx1][ColHistoryData.SheepID] > _SheepMaster[_idx0][ColTerminalMst.SheepID]) {
                _SheepList[_idx0] = {
                    'no': _idx0 + 1,
                    'Sheep_id': _SheepMaster[_idx0][ColTerminalMst.SheepID],
                    'Sheep_group': _SheepMaster[_idx0][ColTerminalMst.SheepGroup],
                    'timestamp': '-- not found. --',
                    'status': '9'
                }
                _idx0++;
            } else {
                _idx1++;
            }
        } else {
            _SheepList[_idx0] = {
                'no': _idx0 + 1,
                'Sheep_id': _SheepMaster[_idx0][ColTerminalMst.SheepID],
                'Sheep_group': _SheepMaster[_idx0][ColTerminalMst.SheepGroup],
                'timestamp': '-- not found. --',
                'status': '9'
            }
            _idx0++;
        }
    }
    $('#SheepList').bootstrapTable("load", _SheepList);
}

/*
 * マーカーにクリックイベントを追加
 */
function MarkerEvent(i) {
    // マーカーをクリックしたとき
    Markers[i].addListener('click', function () {
        InfoWindow[i].open(MapObj, Markers[i]);
    });

    // マーカーをクリックしたとき
    Markers[i].addListener('mouseover', function () {
        InfoWindow[i].open(MapObj, Markers[i]);
    });

    // マーカーをクリックしたとき
    Markers[i].addListener('mouseout', function () {
        InfoWindow[i].close(MapObj, Markers[i]);
    });
}

function MakeListData(pIdx, pId, pTimeStamp, pStatus) {
    _SheepList = {
        'no': pIdx,
        'id': pId,
        'timestamp': pTimeStamp,
        'status': pStatus
    }
    return _SheepList;
}

/*
 * 日付の書式変更（戻り値：yyyy/mm/dd hh:mi:ss）
 */
function SystemDateTime(day) {
    const yy = day.getFullYear();
    const mm = ('0' + (day.getMonth() + 1)).slice(-2);
    const dd = ('0' + day.getDate()).slice(-2);
    const hh = ('0' + day.getHours()).slice(-2);
    const mi = ('0' + day.getMinutes()).slice(-2);
    const ss = ('0' + day.getSeconds()).slice(-2);

    let value = yy + '/' + mm + '/' + dd + ' ' + hh + ':' + mi + ':' + ss;
    return value;
}

function GetReferenceTime(pBeforeTime, pAdditionTime) {
    let _befTime = new Date(pBeforeTime);
    _befTime.setSeconds(_befTime.getMinutes() + pAdditionTime);
    let afTime = SystemDateTime(_befTime);
    return afTime;
}

/*
 * 羊情報リストの行背景色設定
 */
function rowStyle(pRow, pIndex) {
    if (pRow['status'] == '1') {
        return {
            classes: 'bg-red',
            css: {
                color: 'white'
            }
        }
    } else if (pRow['status'] == '9') {
        return {
            classes: 'text-light bg-dark'
        }
    }
    return {
        classes: 'bg-white',
        css: {
            color: 'blue'
        }
    }
}

/// _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
///
/// イベント
///
/// _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

/*
 * 羊情報表示モード変更
 */
function ChangeSheepInfo() {
    const _SheepGroupList = document.getElementById("SheepGroupList");
    const _SheepIdList = document.getElementById("SheepIdList");
    const _targetDate = document.getElementById("targetDate");

    _SheepGroupList.value = '';
    _SheepIdList.value = '';

    let _SheepInfoMode = GetSheepInfoMode();
    if (_SheepInfoMode == 0) {
        _SheepGroupList.disabled = true;
        _SheepIdList.disabled = true;
        _targetDate.disabled = true;
    } else {
        _SheepGroupList.disabled = false;
        _SheepIdList.disabled = false;
        _targetDate.disabled = false;
    }

    MakeSheepIdList('');
}

function SetSheepList() {
    const _SheepIdList = document.getElementById("SheepIdList");
    _SheepIdList.value = '';

    let _SheepGrp = document.getElementById("SheepGroupList").value;

    MakeSheepIdList(_SheepGrp);
}

/*
 * 羊情報表示
 */
function SheepInfoDisplay() {
    // 表示区分退避
    let _SheepInfoMode = GetSheepInfoMode();
    let _SheepGrp;
    let _SheepId;

    // 条件指定チェック
    if (_SheepInfoMode == 0) {
        ViewType = 'ALL';
        TargetId = '';
    } else {
        _SheepGrp = document.getElementById("SheepGroupList").value;
        _SheepId = document.getElementById("SheepIdList").value;
        if (_SheepGrp == '' && _SheepId == '') {
            alert('グループ又はIDが未入力！')
            exit;
        } else if (_SheepId == '') {
            ViewType = 'GRP';
            TargetId = _SheepGrp;
        } else {
            ViewType = 'ONE';
            TargetId = _SheepId;
        }
    }

    // マーカーを削除
    InitMap();

    // マップ中央座標移動
    MoveCenter();

    let _historyData;
    if (demo_flag == 0) {
        // 行動履歴データ取得
        _historyData = GetHistoryData();

       // 変数初期化
        DisplayData = [];
        Markers = [];
        InfoWindow = [];

        document.getElementById('resultData').innerText = '';

        if (ViewType == 'ONE') {
            // 並び替え
            _historyData.sort(function (a, b) {
                // ID：昇順
                if (a[ColHistoryData.SheepID] > b[ColHistoryData.SheepID]) return 1;
                if (a[ColHistoryData.SheepID] < b[ColHistoryData.SheepID]) return -1;

                // 取得時間：昇順
                if (a[ColHistoryData.GetDateTime] > b[ColHistoryData.GetDateTime]) return 1;
                if (a[ColHistoryData.GetDateTime] < b[ColHistoryData.GetDateTime]) return -1;
                return 0;
            })
            //console.log(JSON.stringify(_lst, null, 2))
            let _SheepList = ViewHistory(_historyData);

            // 行動履歴リスト生成
            MakeHistoryList(_SheepList);
        } else {
            // 並び替え
            _historyData.sort(function (a, b) {
                // ID：昇順
                if (a[ColHistoryData.SheepID] > b[ColHistoryData.SheepID]) return 1;
                if (a[ColHistoryData.SheepID] < b[ColHistoryData.SheepID]) return -1;

                // 取得時間：降順
                if (a[ColHistoryData.GetDateTime] > b[ColHistoryData.GetDateTime]) return -1;
                if (a[ColHistoryData.GetDateTime] < b[ColHistoryData.GetDateTime]) return 1;
                return 0;
            })
            //console.log(JSON.stringify(_lst, null, 2))

            if (ViewType == 'ALL') {
                ViewFinalPoint(_historyData);
            } else {
                ViewFinalPoint(_historyData);
            }

            // 最終地点リスト生成
            MakeFinalPointList();
        }

        $("#SheepList").bootstrapTable('resetView', { height: 480 });
    } else {
    }
}

/*
 * 吹き出し全消去
 */
function CloseSpeechBubble() {
    for (var i = 0; i <= InfoWindow.length; i++) {
        InfoWindow[i].close(MapObj, Markers[i]);
    }
}

/*
 * 吹き出し全表示
 */
function FullOpenSpeechBubble() {
    // マーカー毎の処理
    for (var i = 0; i < InfoWindow.length; i++) {
        InfoWindow[i].open(MapObj, Markers[i]);
    }
}

/// _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
///
/// 外部データ取得
///
/// _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

/*
 * CSVデータ読込み
 */
function GetCsvData(pFilePath) {
    // HTTPでファイルを読み込むためのXMLHttpRrequestオブジェクトを生成
    let _req = new XMLHttpRequest();

    // アクセスするファイルを指定
    _req.open('GET', pFilePath, false);

    // HTTPリクエストの発行
    _req.send(null);

    let _result = [];                                   // 最終的な二次元配列を入れるための配列
    let _lines = _req.responseText.split("\n");         // 改行を区切り文字として行を要素とした配列を生成

    // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成（1行目を除く）
    for (let i = 1; i < _lines.length; ++i) {
        let _cells = _lines[i].split(",");
        if (_cells.length != 1) {
            _result.push(_cells);
        }
    }

    // 配列に格納したデータを戻す
    return _result;
}
