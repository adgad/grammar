var koa = require('koa');
var app = koa();
var router = require('koa-router')();
var bodyParser = require('koa-body-parser');
var gingerbread = require('gingerbread');

app.use(bodyParser());

console.log('starting');

router.get('/check/:string', function *(next){
    console.log('getting corrections for', this.params.string);
    var correction = yield getCorrection(this.params.string);
    this.body = correction.slice(0,2);
    yield next;
});

router.post('/checkLots', function*(next) {i

    console.log('recieved post req', this.request.body);
    if(!(this.request.body  && Array.isArray(this.request.body))) {
        this.body = { "error": "Input must be an array of strings" }
        this.status = 400;
        yield next;
        return;
    };
    var corrections = [];
    for (var str of this.request.body) {
        corrections.push((yield getCorrection(str)).slice(0,2));
    }
    
    this.body = corrections;
    yield next;

});

function getCorrection(str) {
    return function(done) {
        gingerbread(str, {}, done);
    };
}

app.use(router.routes());
app.use(router.allowedMethods());
console.log('listening on port ' + (process.env.PORT || 3000));
app.listen(process.env.PORT || 3000);
