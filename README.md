# SQL validator javascript action

This action takes changes sent to the database/migrations and database/seeder, and reviews
each modified file to validate whether they comply with Liquibase annotations for SQL files.

## Inputs

### `new-migrations`

**Required** SQL Migrations files with changes.

### `new-seeders`

**Required** SQL Seeders files with changes.

### `dir`

**Required** Root of the new or changed files.

### `feature-flag`

**Required** The value of the feature flag tells the action to fail 
the PR when any verified SQL file does not match the Liquibase annotations.
default `false`


## Outputs

### `successful-validation`

Validation Status.

## Example usage

```yaml
uses: ./.github/actions/sql-validator
with:
  new-migrations: ${{ MIGRATION_DIFF }}
  new-seeders: ${{ SEEDERS_DIFF }}
  dir: ${{ DIR }}
  feature-flag: true
```
