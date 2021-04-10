#!/usr/bin/env node
//node
const path = require("path");
const fs = require("fs");
const spawn = require("child_process").spawn;
//thirds
const inquirer = require("inquirer");
//this package
const local = require("./get-locale")();
const getFileAsync = require("./get-file-async");

(async () => {
    const data = await getFileAsync(path.join(__dirname, "../lib/i18n/i18n.json"));
    let labels = data["en-US"];
    if (data.hasOwnProperty(local)) {
        labels = data[local];
    }
    
    let packageFile, entries, choiceList=[];
    try{
        packageFile = await getFileAsync(path.join(process.cwd(), "package.json"));
        entries = Object.entries(packageFile.scripts);
        choiceList = [];
    }catch(err){
        console.log(labels.errors.not_found); return;
    }

    entries.forEach(([key, value]) => {
        choiceList.push({
            name: key,
            value: key,
            short: `${labels.running} 'npm run ${key}'...`
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
        .catch(error => { });
})()