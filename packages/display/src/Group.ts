import { IJSONOptions, IPickOptions, IPickResult, IPointData } from '@leafer/interface'
import { Branch, useModule, dataProcessor, registerUI, UICreator } from '@leafer/core'

import { IGroup, IGroupData, IGroupInputData, IUI, IUIInputData, IUIJSONData } from '@leafer-ui/interface'
import { GroupData } from '@leafer-ui/data'

import { UI } from './UI'


@useModule(Branch)
@registerUI()
export class Group extends UI implements IGroup {   // tip: rewrited Box

    public get __tag() { return 'Group' }

    public get isBranch(): boolean { return true }

    @dataProcessor(GroupData)
    declare public __: IGroupData

    declare public children: IUI[]

    constructor(data?: IGroupInputData) {
        super(data)
    }

    public reset(data?: IGroupInputData): void {
        this.__setBranch()
        super.reset(data)
    }

    public __setBranch(): void {
        if (!this.children) this.children = []
    }


    // data

    public set(data: IUIInputData, isTemp?: boolean): void {
        if (data.children) {
            const { children } = data
            delete data.children

            if (!this.children) {
                this.__setBranch()
            } else {
                this.clear()
            }

            super.set(data, isTemp)

            let child: IUI
            children.forEach(childData => {
                child = (childData as IUI).__ ? childData as IUI : UICreator.get(childData.tag, childData) as IUI
                this.add(child)
            })

            data.children = children

        } else {
            super.set(data, isTemp)
        }
    }

    public toJSON(options?: IJSONOptions): IUIJSONData {
        const data = super.toJSON(options)
        data.children = this.children.map(child => child.toJSON(options))
        return data
    }


    // hit rewrite

    public pick(_hitPoint: IPointData, _options?: IPickOptions): IPickResult { return undefined }


    // add

    public addAt(child: IUI | IUIInputData, index: number): void {
        this.add(child, index)
    }

    public addAfter(child: IUI | IUIInputData, after: IUI): void {
        this.add(child, this.children.indexOf(after) + 1)
    }

    public addBefore(child: IUI | IUIInputData, before: IUI): void {
        this.add(child, this.children.indexOf(before))
    }

    // Branch rewrite

    public add(_child: IUI | IUIInputData, _index?: number): void { }

    public addMany(..._children: IUI[] | IUIInputData[]): void { }

    public remove(_child?: IUI, _destroy?: boolean): void { }

    public removeAll(_destroy?: boolean): void { }

    public clear(): void { }

}
