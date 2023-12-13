const core = require('@actions/core');
const github = require('@actions/github');
const {error} = require("@actions/core");
let client;
let prNumber;

try {
    console.log(`****** SQL file validator Started ******`)
    // Annotations to check.
    const liquibaseHeader = `--liquibase formatted sql`;
    const liquibaseComment = `--comment: `;
    const liquibaseChangeset = `--changeset `;
    const liquibaseFilePath = `logicalFilePath:`;
    const liquibaseFullChangeset = `--changeset {AUTHOR}:1_{ID} logicalFilePath:{migrations/seeders}/{FILENAME}`;
    const liquibaseFullComment = `--comment: {FILENAME}`;

    // Inputs defined in action metadata file.
    console.log(`Getting the supplied inputs.`)
    const token = core.getInput('token');
    const passEmoji = core.getInput('pass-emoji');
    const failEmoji = core.getInput('fail-emoji');
    const jobUrl = core.getInput('job-url');
    const newMigrations = core.getInput('new-migrations');
    const newSeeders = core.getInput('new-seeders');
    const dir = core.getInput('dir');
    const featureFlag = core.getInput('feature-flag');
    let featureFlagStatus = (featureFlag === 'true')
    let failedFiles = [];

    let newMigrationsArray = [];
    if (newMigrations != null) {
        newMigrationsArray = newMigrations.split(" ");
    }

    let newSeedersArray = [];
    if (newSeeders != null) {
        newSeedersArray = newSeeders.split(" ");
    }

    console.log(`passEmoji -> ${passEmoji}`)
    console.log(`failEmoji -> ${failEmoji}`)
    console.log(`Migrations files with changes -> ${newMigrationsArray}`)
    console.log(`Seeder files with changes -> ${newSeedersArray} `)
    console.log(`Root path -> ${dir} `)
    console.log(`Feature Flag Status -> ${featureFlagStatus} \n`)

    let alreadyAdded = false;
    let migrationsStatus = 0;

    if (newMigrationsArray.length > 0) {
        for (let i = 0; i < newMigrationsArray.length; i++) {

            if (newMigrationsArray[i].endsWith(`.sql`)) {
                console.log(`Checking file => ${newMigrationsArray[i]}`)
                const fs = require("fs");
                let contents = fs.readFileSync(dir + `/database/migrations/` + newMigrationsArray[i]).toString().split(/\r?\n/);

                if (contents[0].toString() !== liquibaseHeader) {
                    console.log(`\nThe file does not meet the required annotation format. [File:${newMigrationsArray[i]}] [Line number: 1].`)
                    console.log(`The expected annotation should be: ${liquibaseHeader}`)
                    migrationsStatus = migrationsStatus + 1;
                    if (!alreadyAdded) {
                        failedFiles.push(newMigrationsArray[i]);
                        alreadyAdded = true;
                    }
                }

                let numberOfComments = 0;
                let numberOfChangeSet = 0;

                for (let j = 1; j < contents.length; j++) {
                    let line = contents[j].toString();

                    if (line.startsWith(`--`)) {

                        if (line.startsWith(liquibaseComment)) {
                            numberOfComments = numberOfComments + 1;
                        } else if (line.startsWith(liquibaseChangeset) && line.includes(liquibaseFilePath)) {
                            numberOfChangeSet = numberOfChangeSet + 1;
                        } else {
                            console.log(`\nThe file does not meet the required annotation format. [File:${newMigrationsArray[i]}] [Line number: ${j + 1}].`)
                            console.log(`The allowed annotations are:\n- For custom comments: ${liquibaseFullComment}\n- For Changesets: ${liquibaseFullChangeset}`)
                            migrationsStatus = migrationsStatus + 1;
                            if (!alreadyAdded) {
                                failedFiles.push(newMigrationsArray[i]);
                                alreadyAdded = true;
                            }
                        }
                    }
                }

                if (numberOfComments === 0) {
                    console.log(`\nThe File does not present any Comment type annotation with the proper format. [File:${newMigrationsArray[i]}]`)
                    console.log(`There must be at least one Comment type annotation in the file.\ne.g: ${liquibaseFullComment}`)
                    migrationsStatus = migrationsStatus + 1;
                    if (!alreadyAdded) {
                        failedFiles.push(newMigrationsArray[i]);
                        alreadyAdded = true;
                    }
                }

                if (numberOfChangeSet === 0) {
                    console.log(`\nThe File does not present any Changeset type annotation with the proper format. [File:${newMigrationsArray[i]}]`)
                    console.log(`There must be at least one Changeset type annotation in the file.\ne.g: ${liquibaseFullChangeset}`)
                    migrationsStatus = migrationsStatus + 1;
                    if (!alreadyAdded) {
                        failedFiles.push(newMigrationsArray[i]);
                        alreadyAdded = true;
                    }
                }
                alreadyAdded = false;
                console.log(`File checked. \n`)
            }
        }
    }

    let seedersStatus = 0;

    if (newSeedersArray.length > 0) {
        for (let i = 0; i < newSeedersArray.length; i++) {

            if (newSeedersArray[i].endsWith(`.sql`)) {
                console.log(`Checking file => ${newSeedersArray[i]}`)
                const fs = require("fs");
                let contents = fs.readFileSync(dir + `/database/seeders/` + newSeedersArray[i]).toString().split(/\r?\n/);

                if (contents[0].toString() !== liquibaseHeader) {
                    console.log(`\nThe file does not meet the required annotation format. [File:${newSeedersArray[i]}] [Line number: 1].`)
                    console.log(`The expected annotation should be: ${liquibaseHeader}`)
                    seedersStatus = seedersStatus + 1;
                    if (!alreadyAdded) {
                        failedFiles.push(newSeedersArray[i]);
                        alreadyAdded = true;
                    }
                }

                let numberOfComments = 0;
                let numberOfChangeSet = 0;

                for (let j = 1; j < contents.length; j++) {
                    let line = contents[j].toString();

                    if (line.startsWith(`--`)) {

                        if (line.startsWith(liquibaseComment)) {
                            numberOfComments = numberOfComments + 1;
                        } else if (line.startsWith(liquibaseChangeset) && line.includes(liquibaseFilePath)) {
                            numberOfChangeSet = numberOfChangeSet + 1;
                        } else {
                            console.log(`\nThe file does not meet the required annotation format. [File:${newSeedersArray[i]}] [Line number: ${j + 1}].`)
                            console.log(`The allowed annotations are:\n- For custom comments: ${liquibaseFullComment}\n- For Changesets: ${liquibaseFullChangeset}`)
                            seedersStatus = seedersStatus + 1;
                            if (!alreadyAdded) {
                                failedFiles.push(newSeedersArray[i]);
                                alreadyAdded = true;
                            }
                        }
                    }
                }

                if (numberOfComments === 0) {
                    console.log(`\nThe File does not present any Comment type annotation with the proper format. [File:${newSeedersArray[i]}]`)
                    console.log(`There must be at least one Comment type annotation in the file.\ne.g: ${liquibaseFullComment}`)
                    seedersStatus = seedersStatus + 1;
                    if (!alreadyAdded) {
                        failedFiles.push(newSeedersArray[i]);
                        alreadyAdded = true;
                    }
                }

                if (numberOfChangeSet === 0) {
                    console.log(`\nThe File does not present any Changeset type annotation with the proper format. [File:${newSeedersArray[i]}]`)
                    console.log(`There must be at least one Changeset type annotation in the file.\ne.g: ${liquibaseFullChangeset}`)
                    seedersStatus = seedersStatus + 1;
                    if (!alreadyAdded) {
                        failedFiles.push(newSeedersArray[i]);
                        alreadyAdded = true;
                    }
                }
                console.log(`File checked. \n`)
                alreadyAdded = false;
            }
        }
    }

    prNumber = github.context.payload.pull_request?.number
    console.log(`Creating client to publish comment.`)
    client = github.getOctokit(token);
    console.log(`Client created successfully.`)

    let failedFilesToPrint = '';
    for (let k = 0; k < failedFiles.length; k++) {
        failedFilesToPrint = `${failedFilesToPrint}\n ${failedFiles[k]}`
    }

    if (migrationsStatus > 0 || seedersStatus > 0) {
        core.setOutput("successful-validation", false);

        const body =`${failEmoji} The following files do not meet the required Liquibase annotations. ${failedFilesToPrint} \n\n More details at: ${jobUrl}`;
        client.rest.issues.createComment({issue_number: prNumber, body, ...github.context.repo,})

        if (featureFlagStatus) {
            core.setFailed(`One or more files do not match Liquibase annotations.`);
        }
        console.log(`****** SQL file validator Ended ******`)

    } else {
        core.setOutput("successful-validation", true);
        const body =`${passEmoji} All files comply with the Liquibase annotations. ${failedFilesToPrint} `;
        client.rest.issues.createComment({issue_number: prNumber, body, ...github.context.repo,})
        console.log(`****** SQL file validator Ended ******`)
    }

} catch (error) {
    console.log(`Exit with error.`)

    const body =`An exception was caught trying to validate the SQL files. [exception = ${error}] `;
    client.rest.issues.createComment({issue_number: prNumber, body, ...github.context.repo,})
}

