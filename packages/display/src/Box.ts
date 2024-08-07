import { ILeaferCanvas, IRenderOptions, IBoundsData, IBoolean } from '@leafer/interface'
import { rewrite, rewriteAble, registerUI, BoundsHelper, dataProcessor, affectRenderBoundsType, dataType } from '@leafer/core'

import { IBox, IBoxData, IBoxInputData, IOverflow } from '@leafer-ui/interface'
import { BoxData } from '@leafer-ui/data'

import { Group } from './Group'
import { Rect } from './Rect'

const rect = Rect.prototype
const group = Group.prototype
const childrenRenderBounds = {} as IBoundsData
const { copy, add, includes, copyAndSpread } = BoundsHelper

@rewriteAble()
@registerUI()
export class Box extends Group implements IBox {

    public get __tag() { return 'Box' }

    public get isBranchLeaf(): boolean { return true }

    @dataProcessor(BoxData)
    declare public __: IBoxData

    @dataType(false)
    public resizeChildren?: IBoolean

    @affectRenderBoundsType('show')
    declare public overflow?: IOverflow

    public isOverflow: boolean

    constructor(data?: IBoxInputData) {
        super(data)
        this.__layout.renderChanged || this.__layout.renderChange()
    }

    @rewrite(rect.__updateStrokeSpread)
    public __updateStrokeSpread(): number { return 0 }

    @rewrite(rect.__updateRenderSpread)
    public __updateRectRenderSpread(): number { return 0 }

    public __updateRenderSpread(): number {
        return this.__updateRectRenderSpread() || -1
    }


    @rewrite(rect.__updateBoxBounds)
    public __updateRectBoxBounds(): void { }

    public __updateBoxBounds(secondLayout?: boolean): void {
        const data = this.__

        if (this.children.length) {
            if (data.__autoSide) {

                if (this.leafer && this.leafer.ready) this.leafer.layouter.addExtra(this)
                super.__updateBoxBounds()

                const { boxBounds } = this.__layout

                if (!data.__autoSize) {
                    if (data.__autoWidth) boxBounds.width += boxBounds.x, boxBounds.height = data.height, boxBounds.y = boxBounds.x = 0
                    else boxBounds.height += boxBounds.y, boxBounds.width = data.width, boxBounds.x = boxBounds.y = 0
                }

                if (secondLayout && data.flow && data.padding) copyAndSpread(boxBounds, boxBounds, data.padding, false, data.__autoSize ? null : (data.__autoWidth ? 'width' : 'height'))

                this.__updateNaturalSize()

            } else {
                this.__updateRectBoxBounds()
            }

            if (data.flow) this.__updateContentBounds()

        } else {
            this.__updateRectBoxBounds()
        }
    }

    @rewrite(rect.__updateStrokeBounds)
    public __updateStrokeBounds(): void { }

    public __updateRenderBounds(): void {
        let isOverflow: boolean
        const { renderBounds } = this.__layout

        if (this.children.length) {
            super.__updateRenderBounds()
            copy(childrenRenderBounds, renderBounds)
            this.__updateRectRenderBounds()

            isOverflow = !includes(renderBounds, childrenRenderBounds) || !this.pathInputed || !this.__.cornerRadius // 路径与圆角直接当溢出处理
        } else {
            this.__updateRectRenderBounds()
        }

        this.isOverflow !== isOverflow && (this.isOverflow = isOverflow)
        if (!(this.__.__drawAfterFill = this.__.overflow === 'hide') && isOverflow) add(renderBounds, childrenRenderBounds)
    }

    @rewrite(rect.__updateRenderBounds)
    public __updateRectRenderBounds(): void { }

    @rewrite(rect.__updateChange)
    public __updateRectChange(): void { }

    public __updateChange(): void {
        super.__updateChange()
        this.__updateRectChange()
    }


    @rewrite(rect.__render)
    public __renderRect(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }

    @rewrite(group.__render)
    public __renderGroup(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }


    public __render(canvas: ILeaferCanvas, options: IRenderOptions): void {
        if (this.__.__drawAfterFill) {
            this.__renderRect(canvas, options)
        } else {
            this.__renderRect(canvas, options)
            if (this.children.length) this.__renderGroup(canvas, options)
        }
    }

    public __drawAfterFill(canvas: ILeaferCanvas, options: IRenderOptions): void {
        const { length } = this.children
        if (this.isOverflow) {
            canvas.save()
            canvas.clip()
            if (length) this.__renderGroup(canvas, options)
            canvas.restore()
        } else {
            if (length) this.__renderGroup(canvas, options)
        }

        if (this.__.stroke && length) {
            canvas.setWorld(this.__nowWorld)
            this.__drawRenderPath(canvas)
        }
    }

}
