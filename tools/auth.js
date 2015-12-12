/* global exports */

var $ = require('jquery');
var hostconfig = require('./host');
var host = hostconfig.host;
var auth_host = hostconfig.auth_host;

var ajax = exports.ajax = $.ajax;

/**
 * @param {type} str
 * @returns {String}
 */
var decToHex = exports.decToHex = function (str) {
    var res = [];
    for (var i = 0; i < str.length; i++)
        res[i] = ("00" + str.charCodeAt(i).toString(16)).slice(-4);
    return "\\u" + res.join("\\u");
};


/**
 * @param {type} str
 * @returns {unresolved}
 */
var hexToDec = exports.hexToDec = function (str) {
    str = str.replace(/\\/g, "%");
    return unescape(str);
};

/**
 * 存放Cookies: 两个参数
 * @param {type} name cookie名
 * @param {type} value 值
 * @returns {undefined}
 */
var setCookie = exports.setCookie = function (name, value) {
    var Days = 1;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";path='/'";
};

/**
 * 获取cookie
 * @param {type} name
 * @returns {string} cookie的值
 */
var getCookie = exports.getCookie = function (name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else {
        location.href = host + "/login";
        return null;
    }
};

/**
 * 获取cookie
 * @param {type} name
 * @returns {string} cookie的值
 */
var _getCookie = function (name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else {
        return null;
    }
};

/**
 * 获取cookies
 * @returns {string} cookie的值
 */
var getCookies = exports.getCookies = function () {
    var ldap_user = _getCookie("ldap_user");
    var ldap_name = _getCookie("ldap_name");
    var ldap_number = _getCookie("ldap_number");
    var ldap_mail = _getCookie("ldap_mail");
    var ldap_auth = _getCookie("ldap_auth");
    if(!ldap_name || !ldap_user || !ldap_number || !ldap_auth){
        alert("登录已超时，请重新登录！");
        location.href = host + "/login";
    }
    return {
        ldap_user: ldap_user,
        ldap_name: ldap_name,
        ldap_number: ldap_number,
        ldap_mail: ldap_mail,
        ldap_auth: ldap_auth
    };
};

/**
 * 删除指定名称的cookie
 * @param {type} name
 * @returns {undefined}
 */
var delCookie = exports.delCookie = function (name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null)
        document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
};

/**
 * 用户登录
 * @param {json} user{username: name, password: word} 用户数据
 * @param {function} callback 登录回调函数
 * @returns {undefined}
 */
exports.login = function (user, callback) {
    ajax({
        url: auth_host + '/login',
        type: 'post',
        dataType: 'json',
        data: {
            username: $.trim(user.username),
            password: $.trim(user.password)
        },
        success: function (data) {
            if (data.ok == true) {
                for (var i in data.obj) {
                    setCookie(i, data.obj[i]);
                }
            }
            callback(data);
        }
    });
};

/**
 * 手动创建表单提交数据
 * @param {type} datas{key1: value1, key2:value2...}键值对
 * @param {type} action 提交的URL
 * @param {type} method 提交的方式
 * @param {type} enctype mime
 * @returns {undefined}
 */
var _createForm = function (datas, action, method, enctype) {
    // 创建Form  
    var form = $('<form></form>');
    // 设置属性
    var params = "";
    for (var key in datas) {
        params += '<input type="hidden" name="' + key + '" value="' + datas[key] + '" />';
    }
    form.html(params);
    form.attr('action', action);
    form.attr('method', method);
    form.attr('enctype', enctype || "application/x-www-form-urlencoded");

    form.serializeArray();
    // 提交表单  
    form.submit();
};

/**
 * 手动创建表单提交数据
 * @param {type} datas{key1: value1, key2:value2...}键值对
 * @param {type} action 提交的URL
 * @param {type} method 提交的方式
 * @param {type} enctype mime
 * @returns {undefined}
 */
exports.createForm = function (datas, action, method, enctype) {
    // 设置属性
    var url = "";
    for (var key in datas) {
        url += "&" + key + "=" + datas[key];
    }
    url = action + "?" + url.substring(1);
    
    var cookies = getCookies();
    var formParams = {};
    formParams.url = url;
    formParams.type = method || "post";
    formParams.cuser = cookies.ldap_user;
    formParams.cname = cookies.ldap_name;
    formParams.cuid = cookies.ldap_number;
    formParams.cauth = cookies.ldap_auth;
    formParams.contentType = enctype || "application/x-www-form-urlencoded";
    
    _createForm(formParams, host + "/ajax", "post");
};

/**
 * 
 * @param {type} file
 * @param {type} datas
 * @param {type} action
 * @param {type} method
 * @param {type} enctype
 * @returns {undefined}
 */
var _creatFileForm = function(file, datas, action, method){
    // 创建Form  
    var form = $('<form enctype="multipart/form-data"></form>');
    // 设置属性
    var params = "";
    params += '<input type="file" name="' + file.name + '" value="' + file.value + '" />';
    for (var key in datas) {
        params += '<input type="hidden" name="' + key + '" value="' + datas[key] + '" />';
    }
    form.html(params);
    form.attr('action', action);
    form.attr('method', method);

    form.serializeArray();
    // 提交表单  
    form.submit();
};

/**
 * 手动创建表单提交数据
 * @param {type} datas{key1: value1, key2:value2...}键值对
 * @param {type} action 提交的URL
 * @param {type} method 提交的方式
 * @param {type} enctype mime
 * @returns {undefined}
 */
exports.createFileForm = function (file, datas, action, method, enctype) {
    // 设置属性
    var url = "";
    for (var key in datas) {
        url += "&" + key + "=" + datas[key];
    }
    url = action + "?" + url.substring(1);
    
    var cookies = getCookies();
    var formParams = {};
    formParams.url = url;
    formParams.type = method || "post";
    formParams.cuser = cookies.ldap_user;
    formParams.cname = cookies.ldap_name;
    formParams.cuid = cookies.ldap_number;
    formParams.cauth = cookies.ldap_auth;
    formParams.contentType = enctype || "application/x-www-form-urlencoded";
    
    _creatFileForm(file, formParams, host + "/fileupload", "post");
};

/**
 * 用户退出操作
 * @returns {undefined}
 */
exports.logout = function (callback) {
    ajax({
        url: auth_host + '/logout',
        type: 'post',
        dataType: 'json',
        success: function (data) {
            if (data.ok == true) {
                delCookie("ldap_user");
                delCookie("ldap_mail");
                delCookie("ldap_number");
                delCookie("ldap_name");
                delCookie("ldap_auth");
            }
            callback(data);
        }
    });
};

/**
 * 权限验证
 * @param {string} optype 当前操作类型
 * @param {function} callback 成功时回调函数
 * @param {string} user 指定用户,设置为null
 * @returns {undefined}
 */
exports.verifyAuth = function (opttype, callback, user) {
    var cookies = getCookies();
    ajax({
        url: auth_host + '/verify',
        type: 'post',
        dataType: 'json',
        data: {
            user: user || cookies.ldap_user,
            cuser: cookies.ldap_user,
            cname: cookies.ldap_name,
            cuid: cookies.ldap_number,
            cauth: cookies.ldap_auth,
            opttype: opttype
        },
        success: function (data) {
            if (data.ok == false) {
                alert(data.msg);
                if ( data.code === 4) {
                    location.href = host + "/login";
                }
            }else{
                callback(data);
            }
        }
    });
};

/**
 * 权限验证
 * @param {string} optype 当前操作类型
 * @param {function} callback 成功时回调函数
 * @param {function} errcallback 失败时回调函数
 * @returns {undefined}
 */
exports.verifyUserAuth = function (opttype, callback) {
    var cookies = getCookies();
    ajax({
        url: auth_host + '/verify',
        type: 'post',
        dataType: 'json',
        data: {
            cuser: cookies.ldap_user,
            cname: cookies.ldap_name,
            cuid: cookies.ldap_number,
            cauth: cookies.ldap_auth,
            user: cookies.ldap_user,
            opttype: opttype
        },
        success: function (data) {
            if (data.ok == false) {
                alert(data.msg);
                if (data.code === 4) {
                    location.href = host + "/login";
                }
            }else{
                callback(data);
            }
        }
    });
};

/**
 * 获取用户权限
 * @param {type} user
 * @param {type} callback
 * @param {type} errcallback
 * @returns {undefined}
 */
exports.getUserAuth = function (user, callback) {
    var cookies = getCookies();
    ajax({
        url: auth_host + '/auth/' + cuser,
        type: 'post',
        dataType: 'json',
        data: {
            user: user || cookies.ldap_user,
            cuser: cookies.ldap_user,
            cname: cookies.ldap_name,
            cuid: cookies.ldap_number,
            cauth: cookies.ldap_auth
        },
        success: function (auth) {
            callback(auth);
        }
    });
};

/**
 * 获取用户权限
 * @param {type} user
 * @param {type} callback
 * @returns {undefined}
 */
exports.getAuth = function (callback) {
    var cookies = getCookies();
    ajax({
        url: auth_host + '/auth/' + getCookie("ldap_user"),
        type: 'post',
        dataType: 'json',
        data: {
            cuser: cookies.ldap_user,
            cname: cookies.ldap_name,
            cuid: cookies.ldap_number,
            cauth: cookies.ldap_auth,
        },
        success: function (auth) {
            callback(auth);
        }
    });
};

/**
 * 获取指定类型的用户列表
 * @param {type} utype
 * @param {type} online
 * @param {type} callback
 * @returns {undefined}
 */
exports.getUsersByType = function (utype, online, callback) {
    var cookies = getCookies();
    ajax({
        url: auth_host + '/users',
        type: 'post',
        dataType: 'json',
        data: {
            utype: utype,
            online: online,
            cuser: cookies.ldap_user,
            cname: cookies.ldap_name,
            cuid: cookies.ldap_number,
            cauth: cookies.ldap_auth,
        },
        success: function (data) {
            callback(data);
        }
    });
};

/**
 * 获取指定类型的用户列表
 * @param {type} params {utype:utype,online:online,role:role,level:level}
 * @param {type} callback
 * @returns {undefined}
 */
exports.getUsersByParams = function (params, callback) {
    
    var cookies = getCookies();
    params.cuser = cookies.ldap_user;
    params.cname = cookies.ldap_name;
    params.cuid = cookies.ldap_number;
    params.cauth = cookies.ldap_auth;
    
    ajax({
        url: auth_host + '/users',
        type: 'post',
        dataType: 'json',
        data: params,
        success: function (data) {
            callback(data);
        }
    });
};

/**
 * ajax代理
 * @param {type} params
 * @returns {undefined}
 */
exports.ajaxProxy = function(params){
    if(!params){
        alert("必须传递一个参数!");
        return;
    }
    if(!params.url){
        alert("必须传递一个url属性");
        return;
    }
    if(!params.success){
        alert("必须传递一个success回调函数");
        return;
    }
    var ajaxParams = {};
    ajaxParams.url = params.url;
    ajaxParams.type = params.type || "post";
    ajaxParams.dataType = params.dataType || "json";
    
    var cookies = getCookies();
    ajaxParams.cuser = cookies.ldap_user;
    ajaxParams.cname = cookies.ldap_name;
    ajaxParams.cuid = cookies.ldap_number;
    ajaxParams.cauth = cookies.ldap_auth;
    
    if(params.data){
        ajaxParams.data = params.data;
    }
    if(params.contentType){
        ajaxParams.contentType = params.contentType;
    }

    ajax({
        url: auth_host + "/ajax",
        type: "post",
        dataType: 'json',
        data: ajaxParams,
        success: params.success,
        error: params.error
    });
};

exports.sendSettingsToBg = function (settingdata) {
    console.log(settingdata);
    
    if (settingdata.type != 2) {
        ajax({
            url: telmarket_host + "/user/offline/" + settingdata.uid,
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                console.info(data);
            },
            error:function(err){
                console.log(err);
            }
        });
    }

    if (settingdata.type === 2) {
        var addData = {
            "wacUserAliasName": settingdata.displayName,
            "wacUserCn": settingdata.name,
            "wacUserId": settingdata.uid,
            "online": settingdata.status
        };
        ajax({
            url: telmarket_host + '/user/add',
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(addData),
            success: function (data) {
                if (data.status !== 1) {
                    alert(data.msg);
                }
                console.info(data);
            }
        });

        var arr = settingdata.auths.filter(function (a) {
            return a === "tel_operate";
        });
        var lineUrl;
        if (settingdata.status === 1 && arr.length === 1) {
            lineUrl = "/user/online/";
        } else {
            lineUrl = "/user/offline/";
        }
        lineUrl += settingdata.uid;
        ajax({
            url: telmarket_host + lineUrl,
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                if (data.status !== 1) {
                    alert(data.msg);
                }
                console.info(data);
            }
        });
    } else if (settingdata.type === 1) {
        var workerArray = [];
        workerArray.push({
            created: new Date(),
            id: 0,
            name: "dunning",
            phase: settingdata.level,
            status: settingdata.status,
            worker: settingdata.alias,
            workerName: settingdata.displayName
        });
        ajax({
            url: cuishou_host + '/assignment/groups/add',
            type:'post',
            dataType:'json',
            contentType: 'application/json',
            data:JSON.stringify(workerArray),
            success:function(data){
                if(data && data.status == 1){
                    alert("权限设置成功！");
                }else{
                    alert(data.msg);
                }
            }
        });
    }
};