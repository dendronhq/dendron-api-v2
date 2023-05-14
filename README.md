# Dendron API V2

This is an experimental version of Dendron Internal API


## Getting Started

1. Clone the repo
    ```sh
    git clone https://github.com/dendronhq/dendron-api-v2.git
    ```
2. Install dependencies
    ```
    cd dendron-api-v2
    yarn 
    ```
3. Run
    ```sh
    yarn dev
    ```

## Usage

### SyncTo 

Exports a vault of dendron dot delimited markdown to a folder based markdown structure

Parameters:
- src: source 
- dest: destination
- targetFormat: `markdown|html`
- include: hierarchies to include in output, follows `glob` pattern
- exclude: hierarchies to ignore in output, follows `glob` pattern
- deleteMissing: should we delete files in `dest` that are not present in `src`


> NOTE: replace `src` and `dest` with your folders
```sh
curl --location 'localhost:8080/sync/to' \
--header 'Content-Type: application/json' \
--data '{
    "src": "~/code/proj.aws-docs/aws-doc-extractor/build/artifacts",
    "dest": "~/code/proj.aws-docs/aws-reference-notes/services",
    "targetFormat": "markdown",
    "include": "hierarchies=*",
    "exclude": "hierarchies=ignore.*",
    "deleteMissing": false
}'
```