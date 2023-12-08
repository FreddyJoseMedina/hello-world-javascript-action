const core = require('@actions/core');
const github = require('@actions/github');
const {error} = require("@actions/core");

try {
    // Inputs defined in action metadata file
    const newMigrations = core.getInput('new-migrations');
    const newSeeders = core.getInput('new-seeders');
    const dir = core.getInput('dir');

    // Annotations
    const liquibaseHeader = `--liquibase formatted sql`;
    const liquibaseComment = `--comment: `;
    const liquibaseChangeSet = `--changeset `;
    const liquibaseFilePath = `logicalFilePath:`;

    console.log(`Migrations -> ${newMigrations}`);
    console.log(`Seeders -> ${newSeeders}`);
    console.log(`dir -> ${dir} \n`);

    let newMigrationsArray = [];
    if (newMigrations != null) {
        newMigrationsArray = newMigrations.split(" ");
    }
    let newSeedersArray = [];
    if (newSeeders != null) {
        newSeedersArray = newSeeders.split(" ");
    }

    console.log(`New Migrations Files -> ${newMigrationsArray} \nQty of files = ${newMigrationsArray.length}`)
    console.log(`New Sedeer Files -> ${newSeedersArray} \nQty of files = ${newSeedersArray.length}`)
    console.log(`dir = ${dir} }`)

    let migrationsStatus = 0;

    if (newMigrationsArray.length > 0) {
        for (let i = 0; i < newMigrationsArray.length; i++) {

            if (newMigrationsArray[i].endsWith(`.sql`)) {
                const fs = require("fs");
                let contents = fs.readFileSync(dir + `/Database/Migrations/` + newMigrationsArray[i]).toString().split(/\r?\n/);
                console.log(contents);

                if (contents[0].toString() === liquibaseHeader) {
                    let numberOfComments = 0;
                    let numberOfChangeSet = 0;

                    for (let j = 1; j < contents.length; j++) {
                        let line = contents[j].toString();

                        if (line.startsWith(`--`)) {

                            if (line.startsWith(liquibaseComment)) {
                                numberOfComments = numberOfComments + 1;
                            } else if (line.startsWith(liquibaseChangeSet) && line.includes(liquibaseFilePath)) {
                                numberOfChangeSet = numberOfChangeSet + 1;
                            } else {
                                console.log(`File: ${newMigrationsArray[i]} don't match the Liquibase annotation on the Line # ${j + 1}.`)
                                migrationsStatus = migrationsStatus + 1;
                            }
                        }
                    }
                    if (numberOfChangeSet === 0) {
                        console.log(`No Changeset annotations were found in the file:${newMigrationsArray[i]}.`)
                        migrationsStatus = migrationsStatus + 1;
                    }
                    if (numberOfComments === 0) {
                        console.log(`No Coments annotations were found in the file:${newMigrationsArray[i]}.`)
                        migrationsStatus = migrationsStatus + 1;
                    }
                } else {
                    console.log(`File: ${newMigrationsArray[i]} don't match the Liquibase annotation on the Line # 1.`)
                    migrationsStatus = migrationsStatus + 1;
                }
            }
        }
    }

    let seedersStatus = 0;

    if (newSeedersArray.length > 0) {
        for (let i = 0; i < newSeedersArray.length; i++) {

            if (newSeedersArray[i].endsWith(`.sql`)) {
                const fs = require("fs");
                let contents = fs.readFileSync(dir + `/Database/Seeders/` + newSeedersArray[i]).toString().split(/\r?\n/);
                console.log(contents);

                if (contents[0].toString() === liquibaseHeader) {
                    let numberOfComments = 0;
                    let numberOfChangeSet = 0;

                    for (let j = 1; j < contents.length; j++) {
                        let line = contents[j].toString();

                        if (line.startsWith(`--`)) {

                            if (line.startsWith(liquibaseComment)) {
                                numberOfComments = numberOfComments + 1;
                            } else if (line.startsWith(liquibaseChangeSet) && line.includes(liquibaseFilePath)) {
                                numberOfChangeSet = numberOfChangeSet + 1;
                            } else {
                                console.log(`File: ${newSeedersArray[i]} don't match the Liquibase annotation on the Line # ${j + 1}.`)
                                seedersStatus = seedersStatus + 1;
                            }
                        }
                    }
                    if (numberOfChangeSet === 0) {
                        console.log(`No Changeset annotations were found in the file:${newSeedersArray[i]}.`)
                        seedersStatus = seedersStatus + 1;
                    }
                    if (numberOfComments === 0) {
                        console.log(`No Coments annotations were found in the file:${newSeedersArray[i]}.`)
                        seedersStatus = seedersStatus + 1;
                    }
                } else {
                    console.log(`File: ${newSeedersArray[i]} don't match the Liquibase annotation on the Line # 1.`)
                    seedersStatus = seedersStatus + 1;
                }
            }
        }
    }

    if (migrationsStatus > 0 || seedersStatus > 0) {
        throw new error(`One or more files do not match Liquibase annotations.`, undefined);
    }

} catch (error) {
    console.log(`Exit with error.`)
    core.setFailed(error.message);
}
