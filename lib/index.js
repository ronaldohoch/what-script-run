#!/usr/bin/env node
//node
const path = require("path");
const fs = require("fs");
const spawn = require("child_process").spawn;
//thirds
const inquirer = require("inquirer");
//this package
const local = require("./get-locale")();

(async () => {
    const packageFile = path.join(process.cwd(), "package.json");
    const i18nFile = path.join(__dirname, "../lib/i18n/i18n.json");
    var labels;

    fs.readFile(i18nFile, (err, data) => {
        if (err) { console.log(err); return; }
        data = JSON.parse(data);
        labels = data["en-US"];

        if (data.hasOwnProperty(local)) {
            labels = data[local];
        }

        fs.readFile(packageFile, (err, data) => {
            if (err) { console.log(labels.errors.not_found); return; }
            let package = JSON.parse(data);

            const entries = Object.entries(package.scripts);
            let choiceList = [];

            entries.forEach(([key, value]) => {
                // choiceList.push(key);
                choiceList.push({
                    name: key,
                    value: key,
                    short: `${labels.running} 'npm run ${key}' ...`
                });
            });


            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "scripts",
                        message: labels.question,
                        // default:"start",
                        choices: choiceList
                    }
                ])
                .then(answers => {
                    let command = spawn(`npm run ${answers.scripts}`, ["--colors"], {
                        stdio: 'inherit',
                        shell: true,
                    });
                    command.stdout.on('data', function (data) {
                        console.log(data.toString());
                    });
                    command.stderr.on('data', function (data) {
                        console.log(data.toString());
                    });
                    command.on('exit', function (code) {
                        console.log(`${labels.exit_process} ${code.toString()}`);
                    });
                    command.on('error', function (err) { console.log(err); return; })
                })
                .catch(error => {
                    // if (error.isTtyError) { } else { }
                });
        });

    });


})()