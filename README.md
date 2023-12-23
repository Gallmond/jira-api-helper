# Example

see local linking: https://docs.npmjs.com/cli/v10/commands/npm-link
See Gallmond/jira-api-frontent

## TODO
- Auth
    - Can auth user
    - Can get tokens
    - Can refresh tokens
- Sites
- Projects
    - key, name, id
- Issues
    - key, summary, id, status, sub-issue count
    - description
    - comments
    - reporter, assignee, attachments
    - subtasks: key, id, summary, status (subissue count not available on the initial subissues, have to re-fetch)


```ts
// on-page structure like so. Keeps it flat and we can use the API to populate as we go

const issues = {
    'GC-1000' : {
        fetched: new Date().valueOf(), // the timestamp that the on-page data was last updated
        summary: 'foo bar',
        id: 1234,
        status: 'To Do',
        subtasks: ['GC-2000']
    }
    'GC-2000' : {
        summary: 'This is a sub task summary',
        id: 5678,
        status: 'Done',
        subtasks: []
    }
}


```
