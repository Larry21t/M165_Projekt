const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const NodeCouchdb = require('nano')('http://admin:admin@127.0.0.1:5984');

const couch = NodeCouchdb.db.use('rezepte');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    couch.list({ include_docs: true }, (err, body) => {
        if (err) {
            console.error(err);
            return;
        }
        const recipes = body.rows.map(row => row.doc);
        console.log(recipes)
        res.render('index', { recipes });
    });
});

app.post('/search', function (req, res) {
    var searchTerm = req.body.searchTerm;
    couch.find({
        selector: {
            Zutaten: { $elemMatch: { $regex: searchTerm } }
        }
    }, function (err, result) {
        if (err) {
            console.error('Fehler bei der Suche:', err);
            res.sendStatus(500);
            return;
        }
        var recipes = result.docs;
        res.render('index', { recipes });
    });
});

app.listen(3000, function () {
    console.log('Server is started on Port 3000');
});

