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

app.get('/:db/:collection/concepts/:sctid/descriptions/:descriptionId?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var query = {'conceptId': idParam};
    var options = req.params.options || {};

    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];

    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            if (o == "limit" || o == "skip") {
                options[o] = parseInt(req.query[o]);
            } else {
                options[o] = JSON.parse(req.query[o]);
            }
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
                                if (req.params.descriptionId) {
                                    if (parseInt(req.params.descriptionId) == desc.descriptionId) {
                                        result.push(desc);
                                    }
                                } else {
                                    result.push(desc);
                                }
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

    if (req.query["form"]) {
        if (req.query["form"] == "inferred") {
            query = {"relationships": {"$elemMatch": {"target.conceptId": idParam, "active": true, "type.conceptId": 116680003}}};
        }
        if (req.query["form"] == "stated") {
            query = {"statedRelationships": {"$elemMatch": {"target.conceptId": idParam, "active": true, "type.conceptId": 116680003}}};
        }

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
                                result.push(util.flavorize(doc, "out"));
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

app.get('/:db/:collection/descriptions?', function(req, res) {
    if (!req.query["query"] || !req.query["searchmode"] || req.query["searchmode"] != "startswith") {
        res.send(505);
    } else {
        var query = {"descriptions": {"$elemMatch": {"term": {"$regex": ("^" + req.query["query"] + "x*")}, "active": true}}, "active": true};
        var options = req.params.options || {};

        var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];

        for (o in req.query) {
            if (test.indexOf(o) >= 0) {
                if (o == "limit" || o == "skip") {
                    options[o] = parseInt(req.query[o]);
                } else {
                    options[o] = JSON.parse(req.query[o]);
                }
            }
        }
        options["fields"] = {"descriptions.term": 1, "descriptions.conceptId": 1, "descriptions.active": 1};
        var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect': true}));
        db.open(function(err, db) {
            db.authenticate(config.db.username, config.db.password, function() {
                db.collection(req.params.collection, function(err, collection) {
                    collection.find(query, options, function(err, cursor) {
                        cursor.toArray(function(err, docs) {
                            var result = [];
                            if (docs.length > 0) {
                                docs.forEach(function(doc) {
                                    doc.descriptions.forEach(function(desc) {
                                        if (req.params.descriptionId) {
                                            if (parseInt(req.params.descriptionId) == desc.descriptionId) {
                                                result.push(desc);
                                            }
                                        } else {
                                            result.push(desc);
                                        }
                                    });
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
        }
        );
    }
});