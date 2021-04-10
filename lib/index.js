#!/usr/bin/env node

const local = require("./get-locale")();
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");

const exec = require("child_process").exec;
const spawn = require("child_process").spawn;


const { exit } = require("process");

(async ()=>{
    const packageFile = path.join(process.cwd(), "package.json");
    const i18nFile = path.join(__dirname, "../lib/i18n/i18n.json");
    var labels;

    fs.readFile(i18nFile,(err,data)=>{
        if(err){console.log(err);return;}
        data = JSON.parse(data);
        labels = data["en-US"];

        if(data.hasOwnProperty(local)){
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
                    let command = `npm run ${answers.scripts} --colors`;
                    exec(command, (err, stdout, stderr) => {
                        if (err) {
                            console.error(err)
                        } else {
                            console.log(stdout || stderr);
                        }
                    });

                    // spawn('npm run',[answers.scripts],{stdio:'inherit'})
                    //     .on('exit')

                })
                .catch(error => {
                    if (error.isTtyError) {
                        // Prompt couldn't be rendered in the current environment
                    } else {
                        // Something else went wrong
                    }
                });
    
            // return package.scripts;
        });

    });


})()