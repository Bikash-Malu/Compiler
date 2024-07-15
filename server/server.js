const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Function to write code to a file
const writeCodeToFile = (code, fileName) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, code, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

app.post('/compile', async (req, res) => {
    const { language, code } = req.body;

    let command, filename;

    try {
        switch (language) {
            case 'javascript':
                filename = 'program.js';
                await writeCodeToFile(code, filename);
                command = `node ${filename}`;
                break;
            case 'python':
                filename = 'program.py';
                await writeCodeToFile(code, filename);
                command = `python ${filename}`;
                break;
            case 'java':
                filename = 'Main.java';
                await writeCodeToFile(code, filename);
                command = `javac ${filename} && java Main`;
                break;
            case 'c':
                filename = 'program.c';
                await writeCodeToFile(code, filename);
                command = `gcc ${filename} -o program && ./program`;
                break;
            case 'cpp':
                filename = 'program.cpp';
                await writeCodeToFile(code, filename);
                command = `g++ ${filename} -o program && ./program`;
                break;
            default:
                return res.status(400).send('Unsupported language');
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                res.status(500).send(stderr || error.message);
            } else {
                res.send(stdout);
            }

            // Clean up temporary files
            if (filename) {
                fs.unlink(filename, err => {
                    if (err) {
                        console.error(`Error deleting file ${filename}: ${err}`);
                    } else {
                        console.log(`Deleted file ${filename}`);
                    }
                });

                // Additional cleanup for compiled files
                const compiledFile = filename.replace(/\.(java|c|cpp)$/, '');
                fs.unlink(compiledFile, err => {
                    if (err && err.code !== 'ENOENT') {
                        console.error(`Error deleting compiled file ${compiledFile}: ${err}`);
                    } else {
                        console.log(`Deleted compiled file ${compiledFile}`);
                    }
                });
            }
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
