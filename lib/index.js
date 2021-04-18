#!/usr/bin/env node
//node
const path = require("path");
const spawn = require("child_process").spawn;
//thirds
const inquirer = require("inquirer");
const ora = require("ora");
//this package
const local = require("./get-locale")();
const getFileAsync = require("./get-file-async");

(async () => {
    const i18n = ora("🔎 i18n").start();
    const data = await getFileAsync(path.join(__dirname, "../lib/i18n/i18n.json"));
    let labels = data["en-US"];
    if (data.hasOwnProperty(local)) {
        labels = data[local];
    }
    i18n.succeed();
    const packageLoading = ora(labels.loading.packageJson).start();
    
    let packageFile, entries, choiceList=[];
    try{
        packageFile = await getFileAsync(path.join(process.cwd(), "package.json"));
        entries = Object.entries(packageFile.scripts);
        choiceList = [];
        packageLoading.succeed();
    }catch(err){
        packageLoading.fail();
        console.log(labels.errors.not_found); return;
    }

    entries.forEach(([key, value]) => {
        choiceList.push({
            name: key,
            value: key,
            short: ``
            // short: `${labels.running} 'npm run ${key}'...`
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
            const commandLoading = ora(`npm run ${answers.scripts}`).start();
            let command = spawn(`npm run ${answers.scripts}`, ["--colors"], {
                stdio: 'inherit',
                shell: true,
            });
            commandLoading.succeed();
            command.stdout.on('data', function (data) {
                // commandLoading.succeed();
                console.log(data.toString());
            });
            command.stderr.on('data', function (data) {
                // commandLoading.fail();
                console.log(data.toString());
            });
            command.on('exit', function (code) {
                // commandLoading.succeed();
                console.log(`${labels.exit_process} ${code.toString()}`);
            });
            command.on('error', function (err) { 
                // commandLoading.fail();
                console.log(err); return; 
            })
        })
        .catch(error => { });
})()