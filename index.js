var express = require('express'),
  bodyParser = require('body-parser'),
  Hashids = require('hashids'),
  hashid = new Hashids('shortyurl', 6, 'usUSncNC0123456789'),
  db = require('./models'),
  app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/links', function(req, res) {
  db.link.findAll().then(function(link) {
    res.render('links', {myLinks: link, hashid: hashid});
  });
  
});

app.get('/links/:id', function(req, res) {
  var id = req.params.id;
  db.link.find({where: {id: id}}).then(function (links) {
    res.render('show', {myLink: links, hashid: hashid});
  });
});

app.get('/:hash', function(req, res) {
  db.link.find({
    where: {
      id: hashid.decode(req.params.hash)
    }
  }).then(function(link) {
    link.count++;
    link.save().then(function(link) {
      res.redirect(link.url);
    });
  });
});

app.post('/links', function(req, res) {
  var newHash = {
    url: req.body.url,
  };

  db.link.create(newHash).then(function(link){
      link.hash = hashid.encode(link.id);
      link.save().then(function (link){
        res.redirect('/links/' + link.id);
    });
    
  });
  
});

app.listen(process.env.PORT || 3000);