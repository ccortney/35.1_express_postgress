const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async function(req, res, next) {
    try {
        const results = await db.query(`SELECT comp_code, id FROM invoices`);
        return res.json({invoices: results.rows});
    } catch(err) {
        return next(err);
    }
})

router.get("/:id", async function(req, res, next) {
    try {
        const id = req.params.id
        const result = await db.query(
            `SELECT i.id, 
                i.comp_code, 
                i.amt,
                i.paid, 
                i.add_date, 
                i.paid_date,
                c.name,
                c.description
            FROM invoices AS i
            INNER JOIN companies AS c ON (i.comp_code = c.code) 
            WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        }
        const data = result.rows[0];
        const invoice = {
            id: data.id,
            amt: data.amt, 
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date, 
            company: {
                code: data.comp_code,
                name: data.name,
                description: data.description
            }
        }
        return res.json({"invoice": invoice});
    } catch(err) {
        return next(err);
    }
})

router.post("/", async function(req, res, next) {
    try {
        const {comp_code, amt} = req.body;
        const result = await db.query(`SELECT * FROM companies WHERE code = $1`, [comp_code]);
        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${comp_code}`, 404);
        }
        const results = await db.query(`INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2) RETURNING *`, [comp_code, amt]);
        return res.status(201).json({invoice: results.rows[0]})
    } catch(err) {
        return next(err);
    }
})

router.patch("/:id", async function(req, res, next) {
    try {
        const id = req.params.id
        const result = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        }
        const {amt} = req.body;
        const results = await db.query(`UPDATE invoices SET amt = $1 WHERE id = $2
        RETURNING *`, [amt, id]);
        return res.json({invoice: results.rows[0]})
    } catch(err) {
        return next(err);
    }
})

router.delete("/:id", async function(req, res, next) {
    try {
        const id = req.params.id;
        const result = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        };
        await db.query(`DELETE FROM invoices WHERE id = $1`, [id]);
        return res.json({message: `Deleted invoice with id: ${id}`});
    } catch(err) {
        return next(err);
    }
})

module.exports = router;