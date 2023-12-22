class AuthError extends Error {
    constructor(message: string, res?: Response) {
        super(message)
        this.name = 'AuthError'

        console.error({
            message, name: this.name, res: res?.status ?? 'na'
        })
    }
}

class TokensExpiredError extends AuthError {
    constructor(message: string = 'Access token is expired') {
        super(message)
        this.name = 'TokensExpiredError'
    }
}

class TokensRequiredError extends AuthError {
    constructor(message: string = 'Access tokens are missing') {
        super(message)
        this.name = 'TokensRequiredError'
    }
}

class APIRequestError extends Error {
    constructor(
        public message: string = 'Error making API request',
        public res: Response
    ) {
        super(message)
        this.name = 'APIRequestError'
    }
}

export {
    AuthError,
    TokensExpiredError,
    TokensRequiredError,
    APIRequestError,
}
