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
                            res.send(result);
                        }
                        db.close();
                    });
                });
            });
        });
    });
});

app.get('/:db/:collection/concepts/:sctid/parents?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var query = {'conceptId': idParam};
    var options = req.params.options || {};
    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];
    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            options[o] = JSON.parse(req.query[o]);
        }
    }
    options["fields"] = {"relationships": 1, "statedRelationships": 1};
    var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect': true}));
    db.open(function(err, db) {
        db.authenticate(config.db.username, config.db.password, function() {
            db.collection(req.params.collection, function(err, collection) {
                collection.find(query, options, function(err, cursor) {
                    cursor.toArray(function(err, docs) {
                        if (docs.length > 0) {
                            var result = [];
                            if (typeof docs[0].relationships != 'undefined') {
                                if (req.query["form"]) {
                                    if (req.query["form"] == "inferred") {
                                        docs[0].relationships.forEach(function(rel) {
                                            if (rel.active == true && rel.type.conceptId == 116680003) {
                                                result.push({conceptId: rel.target.conceptId, defaultTerm: rel.target.defaultTerm});
                                            }
                                        });
                                    } else if (req.query["form"] == "stated") {
                                        docs[0].statedRelationships.forEach(function(rel) {
                                            if (rel.active == true && rel.type.conceptId == 116680003) {
                                                result.push({conceptId: rel.target.conceptId, defaultTerm: rel.target.defaultTerm});
                                            }
                                        });
                                    }
                                } else {
                                    docs[0].relationships.forEach(function(rel) {
                                        if (rel.active == true && rel.type.conceptId == 116680003) {
                                            result.push({conceptId: rel.target.conceptId, defaultTerm: rel.target.defaultTerm});
                                        }
                                    });
                                }
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

app.get('/:db/:collection/descriptions/:sctid?', function(req, res) {
    var idParam = null;
    var query = {'descriptions.descriptionId': 0};
    var searchMode = "startsWith";
    var searchTerm = null;
    if (req.params.sctid) {
        idParam = parseInt(req.params.sctid);
        query = {'descriptions.descriptionId': idParam};
    }

    if (req.query["query"]) {
        if (!req.query["searchMode"] || req.query["searchMode"] == "startsWith") {
            searchTerm = req.query["query"];
            var wildcarded = "^" + req.query["query"] + "x*";
            query = {"descriptions": {"$elemMatch": {"term": {"$regex": wildcarded}, "active": true}}, "active": true};
        } else if (req.query["searchMode"] == "stemming") {
            searchMode = req.query["searchMode"];
            searchTerm = req.query["query"];
            query = {"text": {"search": searchTerm, "limit": 100, filter: {"active": true}}};
        } else {
            res.send(404);
        }
    }

    if (searchMode == "startsWith") {
        var options = req.params.options || {};
        var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];
        for (o in req.query) {
            if (test.indexOf(o) >= 0) {
                options[o] = JSON.parse(req.query[o]);
            }
        }

        options["limit"] = 100;
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
                                        if (req.params.sctid) {
                                            if (idParam == desc.descriptionId) {
                                                result.push(desc);
                                            }
                                        } else if (searchTerm) {
                                            if (desc.term.substring(0, searchTerm.length) == searchTerm.substring(0, searchTerm.length)) {
                                                result.push({"term": desc.term, "conceptId": desc.conceptId, "active": desc.active});
                                            }
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
        });
    } else if (searchMode == "stemming") {
        var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect': true}));
        db.open(function(err, db) {
            db.authenticate(config.db.username, config.db.password, function() {
                db.command(query, function(err, cb) {
                    console.log("cb: " + JSON.stringify(cb));
                    var result = [];
                    if (cb.results.length > 0) {
                        cb.results.forEach(function(doc) {
                            result.push({"term": doc.obj.term, "conceptId": doc.obj.conceptId, "active": doc.obj.active});
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
    }
});