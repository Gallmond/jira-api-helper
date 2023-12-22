

type ElementTypes = 'string' | 'number' | 'boolean'
const isArray = (val: unknown, of?: ElementTypes): boolean => {
    const isArr = Array.isArray(val)

    if(of && isArr){
        return val.every(item => typeof item === of)
    }

    return isArr
}


const isString = (...args: unknown[]): boolean => {
    return args.every(arg => typeof arg === 'string')
}

const throwIf = (condition: boolean, getError: () => Error): void => {
    if (condition) throw getError()
}

const allTruthy = (things: Record<string, unknown>): boolean => {
    for(const key in things) {
        if(!things[key]) return false
    }
    return true
}

export { 
    allTruthy,
    throwIf,
    isString,
    isArray,
}