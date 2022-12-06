const express = require('express');
const bodyParser = require('body-parser');
const conn = require('./config/db');
const app = express();
const cors = require('cors');
const formidable = require('formidable');
const PORT = process.env.PORT || 5000;
const path = require('path')
const fs = require('fs/promises')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));

// badges
app.get('/api/badges', (req, res) => {
    const querySql = 'SELECT * FROM badges WHERE status = 1'

    conn.query(querySql, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        res.status(200).json({ succes: true, data: rows })
    })
})

app.get('/api/badges/:id', (req, res) => {
    const querySql = `SELECT * FROM badges WHERE id=?`
    conn.query(querySql, req.params.id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        res.status(200).json({ succes: true, data: rows })
    })
})

app.post('/api/badges', (req, res) => {
    const data = { ...req.body };
    const querySql = 'INSERT INTO badges SET ?';
    conn.query(querySql, data, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        res.status(201).json({ succes: true, message: 'Succesfully Insert Data ' })
    })
})
app.post('/api/badges/upload', async (req, res) => {
    // formidable options
    const options = formidable.options = {
        filter: function ({ name, originalFilename, mimetype }) {
            // keep only images
            return mimetype && mimetype.includes("image");
        }
    };
    options.uploadDir = path.join(process.cwd(), "upload")
    options.filename = (name, ext, path, form) => {
        return path.originalFilename;
    }

    options.keepExtensions = true
    options.maxFileSize = 100 * 1024 * 1024
    options.miniFileSize = 1024
    options.multiples = true

    //formidable form 
    const form = new formidable.IncomingForm(options)
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.log("Error parsing the files");
            return res.status(400).json({
                status: "Fail",
                message: "There was an error parsing the files",
                error: err,
            });
        }
    });

    try {
        await fs.readdir(path.join(process.cwd() + "/upload"))
        res.json({ done: "succes" })
    } catch (error) {
        await fs.mkdir(path.join(process.cwd() + "/upload",))
    }



})

app.put('/api/badges/:id', (req, res) => {
    const data = { ...req.body };
    const querySqlA = 'SELECT * FROM badges WHERE id=?';
    const querySqlB = 'UPDATE badges SET ?WHERE id=?';
    conn.query(querySqlA, req.params.id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        if (rows.length) {
            // jalankan query update
            conn.query(querySqlB, [data, req.params.id], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Error Ocured', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Data Updated!' });
            });
        } else {
            return res.status(404).json({ message: 'Data Not Found!', success: false });
        }

    })
})

app.put('/api/badges/del/:id', (req, res) => {
    const data = { ...req.body };
    const querySqlA = 'SELECT * FROM badges WHERE id=?';
    const querySqlB = 'UPDATE badges SET status=0 WHERE id=?';
    conn.query(querySqlA, req.params.id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        if (rows.length) {
            // jalankan query update
            conn.query(querySqlB, req.params.id, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Error Ocured', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Data Deleted!' });
            });
        } else {
            return res.status(404).json({ message: 'Data Not Found!', success: false });
        }

    })
})



// user_badges
app.get('/api/user_badges', (req, res) => {
    const querySelect = 'SELECT * FROM user_badges'

    conn.query(querySelect, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        res.status(200).json({ succes: true, data: rows })
    })
})

app.get('/api/user_badges/claim/:id', (req, res) => {
    const queryUpdate = 'UPDATE user_badges SET is_claimed = 1 WHERE id=?'

    conn.query(queryUpdate, req.params.id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        res.status(200).json({ succes: true, data: rows })
    })
})

app.get('/api/user_badges/user_id/:user_id', (req, res) => {
    const querySelect = 'SELECT * FROM user_badges WHERE user_id=?'
    conn.query(querySelect, req.params.user_id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        res.status(200).json({ succes: true, data: rows })
    })
})

app.get('/api/user_badges/badge_id/:badge_id', (req, res) => {
    const querySelect = 'SELECT * FROM user_badges WHERE badge_id=?'
    conn.query(querySelect, req.params.badge_id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        res.status(200).json({ succes: true, data: rows })
    })
})

app.post('/api/user_badges', (req, res) => {
    const data = { ...req.body };
    const queryInsert = 'INSERT INTO user_badges SET ?';
    conn.query(queryInsert, data, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        res.status(201).json({ succes: true, message: 'Succesfully Insert Data ' })
    })
})

app.put('/api/user_badges/:id', (req, res) => {
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM user_badges WHERE id=?';
    const queryUpdate = 'UPDATE user_badges SET ? WHERE id=?';
    conn.query(querySearch, req.params.id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        if (rows.length) {
            // jalankan query update
            conn.query(queryUpdate, [data, req.params.id], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Error Ocured', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Data Updated!' });
            });
        } else {
            return res.status(404).json({ message: 'Data Not Found!', success: false });
        }

    })
})

app.delete('/api/user_badges/:id', (req, res) => {
    const querySql = 'DELETE FROM user_badges where id = ?';
    conn.query(querySql, req.params.id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        res.status(201).json({ succes: true, message: 'Succesfully Deleted Data ' })
    })
})



// user_transaction
app.get('/api/ustrans', (req, res) => {
    const { order_by } = req.query
    const sorty = (sort) => {
        return (sort == 0 ? 'created_at DESC' : order_by)
    }

    const sorting = sorty(order_by)
    const querySql = `SELECT * FROM  user_transaction ORDER BY ${sorting} `

    conn.query(querySql, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        res.status(200).json({ succes: true, data: rows })
    })
})

app.get('/api/ustrans/user_id/:user_id', (req, res) => {
    const { order_by } = req.query
    const sorty = (sort) => {
        return (sort == 0 ? 'created_at DESC' : order_by)
    }

    const sorting = sorty(order_by)
    const querySql = `SELECT * FROM user_transaction WHERE user_id=? ORDER BY ${sorting} `
    conn.query(querySql, req.params.user_id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        res.status(200).json({ succes: true, data: rows })
    })
})

app.post('/api/ustrans', (req, res) => {
    const data = { ...req.body };
    const querySql = 'INSERT INTO user_transaction SET ?';
    conn.query(querySql, data, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        res.status(201).json({ succes: true, message: 'Succesfully Insert Data ' })
    })
})

app.put('/api/ustrans/:id', (req, res) => {
    const data = { ...req.body };
    const querySqlA = 'SELECT * FROM user_transaction WHERE id=?';
    const querySqlB = 'UPDATE user_transaction SET ? WHERE id=?';
    conn.query(querySqlA, req.params.id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        if (rows.length) {
            // jalankan query update
            conn.query(querySqlB, [data, req.params.id], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Error Ocured', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Data Updated!' });
            });
        } else {
            return res.status(404).json({ message: 'Data Not Found!', success: false });
        };

    })
})

app.delete('/api/ustrans/:id', (req, res) => {
    const querySql = 'DELETE FROM user_transaction where id = ? '

    conn.query(querySql, req.params.id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        res.status(200).json({ succes: true, message: "succesfully deleted the data" })
    })
})



// user
app.get('/api/user', (req, res) => {
    const querySql = 'SELECT * FROM  user WHERE status=1 '

    conn.query(querySql, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        res.status(200).json({ succes: true, data: rows })
    })
})

app.get('/api/user/:id', (req, res) => {
    const querySql = 'SELECT * FROM user WHERE id=?'
    conn.query(querySql, req.params.id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        res.status(200).json({ succes: true, data: rows })
    })
})

app.post('/api/user', (req, res) => {
    const data = { ...req.body };
    const querySql = 'INSERT INTO user SET ?';
    conn.query(querySql, data, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        res.status(201).json({ succes: true, message: 'Succesfully Insert Data ' })
    })
})

app.put('/api/user/:id', (req, res) => {
    const data = { ...req.body };
    const querySqlA = 'SELECT * FROM user WHERE id=?';
    const querySqlB = 'UPDATE user SET ? WHERE id=?';
    conn.query(querySqlA, req.params.id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        if (rows.length) {
            // jalankan query update
            conn.query(querySqlB, [data, req.params.id], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Error Ocured', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Data Updated!' });
            });
        } else {
            return res.status(404).json({ message: 'Data Not Found!', success: false });
        }

    })
})

app.put('/api/user/del/:id', (req, res) => {
    const data = { ...req.body };
    const querySqlA = 'SELECT * FROM user WHERE id=?';
    const querySqlB = 'UPDATE user SET status=0 WHERE id=?';
    conn.query(querySqlA, req.params.id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({
                message: 'Error Occured', error: err
            });
        }
        if (rows.length) {
            // jalankan query update
            conn.query(querySqlB, req.params.id, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Error Ocured', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Data Succesfully Deleted!' });
            });
        } else {
            return res.status(404).json({ message: 'Data Not Found!', success: false });
        }

    })
})
