const db = require("./db");

async function createTestData() {
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM invoices");
    await db.query("SELECT setval('invoices_id_seq', 1, false)");


    await db.query(`INSERT INTO companies (code, name, description) 
        VALUES ('testCode1', 'testName1', 'testDescription1'),
        ('testCode2', 'testName2', 'testDescription2') RETURNING *`);

    await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
        VALUES ('testCode1', 100, false, '2018-01-01', null),
        ('testCode1', 200, true, '2018-02-01', '2018-02-02'), 
        ('testCode2', 300, false, '2018-03-01', null) RETURNING  *`);
}

module.exports = {createTestData}