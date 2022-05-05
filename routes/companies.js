const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async function(req, res, next) {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({companies: results.rows});
    } catch(err) {
        return next(err);
    }
})

router.get("/:code", async function(req, res, next) {
    try {
        const comp_code = req.params.code;
        const result = await db.query(
            `SELECT c.code, c.name, c.description, i.name
            FROM companies AS c 
            LEFT JOIN companies_industries AS ci ON c.code = ci.comp_code
            LEFT JOIN industries AS i ON ci.ind_code = i.code
            WHERE c.code = $1;`, [comp_code]);
        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${comp_code}`, 404);
        }
        const {code, name, description} = result.rows[0];
        industries = result.rows.map(ind => ind.name);
        const invResults = await db.query(`SELECT id FROM invoices WHERE comp_code=$1`, [comp_code]);
        invoices = invResults.rows.map(inv => inv.id);
        

        return res.json({code, name, description, industries, invoices});
    } catch(err) {
        return next(err);
    }
})

router.post("/", async function(req, res, next) {
    try {
        const {code, name, description} = req.body;
        const results = await db.query(`INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json({company: results.rows[0]})
    } catch(err) {
        return next(err);
    }
})

router.patch("/:code", async function(req, res, next) {
    try {
        const oldCode = req.params.code;
        const {name, description, code} = req.body;
        const result = await db.query(`UPDATE companies SET 
            name=$1, description=$2, code = $3 WHERE code = $4 RETURNING code, name, description`, 
            [name, description, code, oldCode]);
        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        }
        return res.json({company: result.rows[0]})
    } catch(err) {
        return next(err);
    }
})

router.delete("/:code", async function(req, res, next) {
    try {
        const code = req.params.code;
        const result = await db.query(`SELECT * FROM companies WHERE code = $1`, [code]);
        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        };
        await db.query(`DELETE FROM companies WHERE code = $1`, [code]);
        return res.json({message: `Deleted company with code: ${code}`});
    } catch(err) {
        return next(err);
    }
})


module.exports = router;