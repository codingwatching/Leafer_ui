import { ILeaferBase, ILeaferTypeList, ILeaferTypeFunction } from '@leafer/interface'

import { Debug } from '@leafer/core'

import { addInteractionWindow } from './window'
import { document } from './document'


const debug = Debug.get('LeaferTypeCreator')

export const LeaferTypeCreator = {

    list: {} as ILeaferTypeList,

    register(name: string, fn: ILeaferTypeFunction): void {
        if (list[name]) {
            debug.repeat(name)
        } else {
            list[name] = fn
        }
    },

    run(name: string, leafer: ILeaferBase): void {
        const fn = list[name]
        if (fn) {
            fn(leafer)
        } else {
            debug.error('no', name)
        }
    }

}

const { list, register } = LeaferTypeCreator

register('draw', () => { })

register('custom', () => { })
register('design', addInteractionWindow)
register('document', document)