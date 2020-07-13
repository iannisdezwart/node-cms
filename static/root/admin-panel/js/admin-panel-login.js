var searchParams = new URLSearchParams(window.location.search);
document.addEventListener('keydown', function (e) {
    if (e.key == 'Enter') {
        $('button#login').click();
    }
});
var login = function () {
    var username = $('#username').value.trim();
    var password = $('#password').value;
    request('/admin-panel/workers/login.node.js', { username: username, password: password })
        .then(function (token) {
        Cookies.set('token', token);
        Cookies.set('username', username);
        var redirectUrl = searchParams.get('to');
        if (redirectUrl != null) {
            document.location.pathname = redirectUrl;
        }
        else {
            document.location.pathname = '/admin-panel/';
        }
    })
        .catch(function (res) {
        if (res.status == 403) {
            if ($('.try-again') == null) {
                $('.login').innerHTML += '<span class="try-again">Try again</span>';
            }
        }
    });
};
