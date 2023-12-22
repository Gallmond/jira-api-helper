import { writeFileSync } from 'fs'

type EntityType = 'string' | 'number' | 'boolean'

const isArray = (val: unknown, of?: EntityType): boolean => {
    if(!Array.isArray(val)) return false
    
    return of 
        ? val.every(item => isType(item, of))
        : true
}

const isType = (val: unknown, type: EntityType): boolean => typeof val === type

const isStrings = (...args: unknown[]): boolean => args.every(arg => typeof arg === 'string')

const throwIf = (condition: boolean, getError: () => Error): void|never => {
    if (condition) throw getError()
}

const allTruthy = (things: Record<string, unknown>): boolean => {
    for(const key in things) {
        if(!things[key]) return false
    }
    return true
}

const DEBUG_write = (title: string, dataObject: unknown) => {
    writeFileSync(`./${title}.temp.json`, JSON.stringify(dataObject, null, 2))
}

export { 
    DEBUG_write,
    allTruthy,
    throwIf,
    isStrings,
    isArray,
}