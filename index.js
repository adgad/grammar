var views = require('co-views');
var koa = require('koa');
var app = koa();
var router = require('koa-router')();
var bodyParser = require('koa-body-parser');
var cors = require('koa-cors');
var fetch = require('isomorphic-fetch');

var render = views(__dirname + '/views', { ext: 'ejs' });

var words = {
  noun: [],
  verb: []
}

app.use(bodyParser());
app.use(cors());

var randomEl = function(list) {
  return list.length ? list[Math.floor(Math.random() * list.length)] : '';
}

router.get('/', function *(next){
    var randomNoun = randomEl(words.noun);
    var randomVerb = randomEl(words.verb);
    this.body = yield render('index', {
      noun: randomEl(words.noun),
      noun2: randomEl(words.noun),
      verb: randomEl(words.verb),
      type: randomEl(['Tinder', 'Uber', 'Netflix', 'service', 'service'])
    });
    yield next;
});


function getRandomWords(type) {
    return fetch('http://api.wordnik.com/v4/words.json/randomWords?' + [
        'api_key=' + process.env.wordnik_key,
        'hasDictionaryDef=true',
        'minCorpusCount=50000',
        'includePartOfSpeech=' + type,
        'excludePartOfSpeech=family-name,given-name',
        'limit=1000'].join('&')
    ).then(function(res) {
      if(res.ok) {
        return res.json();
      }
    })
    .then(function(data) {
      if(type === 'verb') {
        words[type] = data.filter(function(word) {
          return word.word.endsWith('ing') || word.word.endsWith('ed');
        }).map(function(word) {
          if(word.word.endsWith('ed')) {
            return capitalizeFirstLetter(word.word.replace(new RegExp('ed$'), 'ing'));
          } else {
            return capitalizeFirstLetter(word.word);
          }
        });
      } else {
        words[type] = data.map(function(word) { return capitalizeFirstLetter(word.word) });
      }
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
setInterval(getRandomWords.bind(this, 'noun'), 1000 * 60 * 1);
getRandomWords('noun');

setInterval(getRandomWords.bind(this, 'verb'), 1000 * 60 * 1);
getRandomWords('verb');
app.use(router.routes());
app.use(router.allowedMethods());
console.log('listening on port ' + (process.env.PORT || 3000));
app.listen(process.env.PORT || 3000);
