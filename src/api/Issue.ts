class MinimalIssue{
    constructor(
        private data: API_IssueListingResponseMinimal,
        public id = data.id,
        public key = data.key,
        public summary = data.fields.summary,
    ){}
}

class Issue{
    constructor(
        private data: API_IssueListingResponse,
        public id = data.id,
        public key = data.key,
        public summary = data.fields.summary,
        public status = data.fields.status,
        public created = new Date(data.fields.created),
        public updated = new Date(data.fields.updated),
        public subIssues = data.fields.subtasks.map((issue) => new MinimalIssue(issue)),
    ){}
}

export default Issue