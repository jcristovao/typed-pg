import * as pg from "../index.d"

var conn1 = new pg.Client("postgres://...")
var query1 = conn1.query("", function(err, result) {

})
pg.cancel({}, conn1, query1)
