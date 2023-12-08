const core = require('@actions/core');
const github = require('@actions/github');

try {
    // `who-to-greet` input defined in action metadata file
    const newMigrations = core.getInput('new-migrations');
    const newSeeders = core.getInput('new-seeders');
    const dir = core.getInput('dir');

    // const newMigrations ='1 2 3';
    // const newSeeders = ` `;
    // const dir = `dir`;
    console.log(`Hello mig ${newMigrations}!!!!!!!`);
    console.log(`Hello sed ${newSeeders}!!!!!!!`);

    let newMigrationsArray = [];
    if (newMigrations != null) {
        newMigrationsArray = newMigrations.split(" ");
    }
    let newSeedersArray = [];
    if (newSeeders != null) {
        newSeedersArray = newSeeders.split(" ");
    }

    console.log(`newMig ${newMigrationsArray} size ${newMigrationsArray.length}`)
    console.log(`newSed ${newSeedersArray} size ${newSeedersArray.length}`)
    console.log(`dir ${dir} size ${dir.length}`)

    // const a = '11.sql 20.sql a.sql'
    // if (a != null) {
    //     console.log(`Hello ${a}     !!!!!!`);}
    // const split_string = a.split(" ");
    // console.log(split_string)
    // const fs = require("fs");
    // let contents = fs.readFileSync("/home/runner/work/ActionsTests/ActionsTests/Database/"+split_string[0]).toString().split(/\r?\n/);
    // console.log(contents);
    // const time = (new Date()).toTimeString();
    // core.setOutput("time", time);


    // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2)
    // console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}
