var mongo = require("mongodb"),
    app = module.parent.exports.app,
    config = module.parent.exports.config;

app.get('/concept', function(req, res) {
  res.send('Hello world'); 
});
