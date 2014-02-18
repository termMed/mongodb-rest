var mongo = require("mongodb"),
        app = module.parent.exports.app,
        config = module.parent.exports.config,
        util = require("./util");

app.get('/:db/:collection/concepts/:sctid?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var query = {'conceptId': idParam};
    var options = req.params.options || {};

    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];

    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            options[o] = JSON.parse(req.query[o]);
        }
    }
    var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect': true}));
    db.open(function(err, db) {
        db.authenticate(config.db.username, config.db.password, function() {
            db.collection(req.params.collection, function(err, collection) {
                collection.find(query, options, function(err, cursor) {
                    cursor.toArray(function(err, docs) {
                        var result = [];
                        if (docs.length > 0) {
                            result = util.flavorize(docs[0], "out");
                            res.header('Content-Type', 'application/json');
                            res.send(result);
                        } else {
                            res.send(404);
                        }
                        db.close();
                    });
                });
            });
        });
    });
});

app.get('/:db/:collection/concepts/:sctid/descriptions?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var query = {'conceptId': idParam};
    var options = req.params.options || {};

    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];

    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            options[o] = JSON.parse(req.query[o]);
        }
    }
    var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect': true}));
    db.open(function(err, db) {
        db.authenticate(config.db.username, config.db.password, function() {
            db.collection(req.params.collection, function(err, collection) {
                collection.find(query, options, function(err, cursor) {
                    cursor.toArray(function(err, docs) {
                        var result = [];
                        if (docs.length > 0) {
                            docs[0].descriptions.forEach(function(desc) {
                                result.push(desc);
                            });
                            res.header('Content-Type', 'application/json');
                            res.send(result);
                        } else {
                            res.send(404);
                        }
                        db.close();
                    });
                });
            });
        });
    });
});

app.get('/:db/:collection/concepts/:sctid/relationships?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var query = {'conceptId': idParam};
    var form = "all";
    if (req.query["form"]) {
        form = req.query["form"];
    }

    var options = req.params.options || {};

    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];

    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            options[o] = JSON.parse(req.query[o]);
        }
    }

    var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect': true}));
    db.open(function(err, db) {
        db.authenticate(config.db.username, config.db.password, function() {
            db.collection(req.params.collection, function(err, collection) {
                collection.find(query, options, function(err, cursor) {
                    cursor.toArray(function(err, docs) {
                        var result = [];
                        if (docs.length > 0) {
                            if (form == "all" || form == "inferred") {
                                docs[0].relationships.forEach(function(desc) {
                                    result.push(desc);
                                });
                            }
                            if (form == "all" || form == "stated") {
                                docs[0].statedRelationships.forEach(function(desc) {
                                    result.push(desc);
                                });
                            }
                            res.header('Content-Type', 'application/json');
                            res.send(result);
                        } else {
                            res.send(404);
                        }
                        db.close();
                    });
                });
            });
        });
    });
});

app.get('/:db/:collection/concepts/:sctid/children?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var query = {"relationships": {"$elemMatch": {"target.conceptId": idParam, "active": true, "type.conceptId": 116680003}}};
    var form = "all";
    if (req.query["form"]) {
        form = req.query["form"];
    }

    var options = req.params.options || {};

    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];

    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            options[o] = JSON.parse(req.query[o]);
        }
    }

    options["fields"] = {"defaultTerm": 1, "conceptId": 1, "active": 1};

    var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect': true}));
    db.open(function(err, db) {
        db.authenticate(config.db.username, config.db.password, function() {
            db.collection(req.params.collection, function(err, collection) {
                collection.find(query, options, function(err, cursor) {
                    cursor.toArray(function(err, docs) {
                        var result = [];
                        if (docs.length > 0) {
                            docs.forEach(function(doc) {
                                result.push(doc);
                            });
                            res.header('Content-Type', 'application/json');
                            res.send(result);
                        } else {
                            res.send(404);
                        }
                        db.close();
                    });
                });
            });
        });
    });
});
