const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async function(req, res, next) {
    try {
        const results = await db.query(`
            SELECT i.name, i.code, ci.comp_code
            FROM industries AS i
            LEFT JOIN companies_industries AS ci
            ON i.code = ci.ind_code`);
        
        let codes = [];

        for (let row of results.rows) {
            if (!codes.includes(row.code)) {
                codes.push(row.code)
            }
        }
        const industries = [];
        for (code of codes) {
            const industry = {code: code};
            industry.name = results.rows.find(row => row.code === code).name;
            industry.companies = results.rows.filter(row => row.code === code).map(obj => obj.comp_code)
            industries.push(industry)
        }

        return res.json({industries: industries});
    } catch(err) {
        return next(err);
    }
})

router.post("/", async function(req, res, next) {
    try {
        const {code, name} = req.body;
        const results = await db.query(`INSERT INTO industries (code, name)
        VALUES ($1, $2) RETURNING code, name`, [code, name]);
        return res.status(201).json({industry: results.rows[0]})
    } catch(err) {
        return next(err);
    }
})

router.post("/:code", async function(req, res, next) {
    try {
        const ind_code = req.params.code;
        const {comp_code} = req.body;
        const results = await db.query(`INSERT INTO companies_industries (comp_code, ind_code)
            VALUES ($1, $2) RETURNING *`, [comp_code, ind_code]);
        return res.status(201).json({assosication: results.rows[0]})
    } catch(err) {
        return next(err);
    }
})

router.patch("/:code", async function(req, res, next) {
    try {
        const oldCode = req.params.code;
        const {name, code} = req.body;
        const result = await db.query(`UPDATE industries SET 
            name=$1, code = $2 WHERE code = $3 RETURNING code, name`, 
            [name, code, oldCode]);
        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find industry with code of ${code}`, 404);
        }
        return res.json({industry: result.rows[0]})
    } catch(err) {
        return next(err);
    }
})

router.delete("/:code", async function(req, res, next) {
    try {
        const code = req.params.code;
        const result = await db.query(`SELECT * FROM industries WHERE code = $1`, [code]);
        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find industry with code of ${code}`, 404);
        };
        await db.query(`DELETE FROM industries WHERE code = $1`, [code]);
        return res.json({message: `Deleted industry with code: ${code}`});
    } catch(err) {
        return next(err);
    }
})



module.exports = router;